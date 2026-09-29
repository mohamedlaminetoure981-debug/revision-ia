// =====================================================================
// importer.js — Import d'un cours (PDF ou photos) et transcription
// ---------------------------------------------------------------------
// Pour économiser ta connexion :
//  - les photos sont réduites (1600 px max) et compressées en JPEG ;
//  - un PDF qui contient déjà du texte est lu DIRECTEMENT sur l'appareil,
//    sans rien envoyer à l'IA ;
//  - un PDF scanné est transformé en images compressées ;
//  - les images sont transcrites en texte par petits lots (3 par envoi).
//    Si la connexion coupe, on peut REPRENDRE là où on s'est arrêté.
//  - Ensuite, résumé / fiches / quiz utilisent seulement le texte (léger).
// =====================================================================

import * as db from './db.js';
import { generateJSON, blobToBase64, AIError } from './gemini.js';
import { SYSTEM, TRANSCRIBE_SCHEMA, transcribePrompt } from '../data/prompts.js';

export const MAX_PDF_MB = 50; // taille maximale d'un PDF
export const MAX_IMAGES = 80; // nombre maximal de pages/photos par cours
const MAX_SIDE = 1600; // taille maximale d'une image (en pixels)
const JPEG_QUALITY = 0.7; // qualité JPEG (0 à 1) : 0.7 = bon compromis
const BATCH_SIZE = 3; // images envoyées par requête de transcription

/** Dessine une source (image ou page) dans un canvas réduit puis la compresse en JPEG. */
function canvasToJpeg(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Compression impossible'))), 'image/jpeg', JPEG_QUALITY);
  });
}

/** Réduit et compresse une photo. Renvoie un Blob JPEG. */
export async function compressImage(file) {
  let source;
  try {
    // createImageBitmap respecte l'orientation de la photo (EXIF).
    source = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Solution de secours pour les vieux navigateurs.
    source = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Image illisible : ${file.name || ''}`));
      img.src = URL.createObjectURL(file);
    });
  }
  const w = source.width;
  const h = source.height;
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; // fond blanc (au cas où l'image est transparente)
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close?.();
  return canvasToJpeg(canvas);
}

/**
 * Charge la bibliothèque pdf.js (incluse dans l'appli, version "legacy"
 * compatible avec les téléphones plus anciens). Elle n'est chargée que
 * lorsqu'on importe un PDF, pour garder l'appli légère.
 */
let pdfjsPromise = null;
function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([
      import('pdfjs-dist/legacy/build/pdf.min.mjs'),
      import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
    ]).then(([lib, worker]) => {
      lib.GlobalWorkerOptions.workerSrc = worker.default;
      return lib;
    }).catch((e) => {
      pdfjsPromise = null;
      throw new AIError('NETWORK', `Impossible de charger le lecteur PDF (connexion ?). ${e.message}`);
    });
  }
  return pdfjsPromise;
}

/**
 * Lit un PDF.
 * - mode 'text'   : le PDF contient du texte → { mode, pages: [{ n, text }] }
 * - mode 'images' : PDF scanné (ou analyse visuelle demandée) → { mode, images: [Blob] }
 */
export async function readPdf(file, { visual = false, onStatus } = {}) {
  if (file.size > MAX_PDF_MB * 1024 * 1024) {
    throw new AIError('TOO_BIG', `📦 PDF trop gros (${(file.size / 1048576).toFixed(1)} Mo). Maximum : ${MAX_PDF_MB} Mo.`);
  }
  onStatus?.('Chargement du lecteur PDF…');
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  if (pdf.numPages > MAX_IMAGES) {
    throw new AIError('TOO_BIG', `📦 PDF trop long (${pdf.numPages} pages). Maximum : ${MAX_IMAGES}. Découpe-le en plusieurs cours.`);
  }

  // 1. On essaie d'extraire le texte directement.
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    onStatus?.(`Lecture du texte, page ${i}/${pdf.numPages}…`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((it) => it.str + (it.hasEOL ? '\n' : ' ')).join('').replace(/[ \t]+/g, ' ').trim();
    pages.push({ n: i, text });
  }
  const avgChars = pages.reduce((s, p) => s + p.text.length, 0) / pages.length;
  if (!visual && avgChars >= 200) return { mode: 'text', pages };

  // 2. PDF scanné (ou analyse visuelle) : on transforme chaque page en image.
  const images = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    onStatus?.(`Conversion en image, page ${i}/${pdf.numPages}…`);
    const page = await pdf.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: Math.min(2.5, MAX_SIDE / Math.max(base.width, base.height)) });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push(await canvasToJpeg(canvas));
  }
  return { mode: 'images', images };
}

/**
 * Crée un cours dans la base. Les images sont enregistrées tout de suite
 * pour pouvoir reprendre la transcription en cas de coupure.
 * @returns {Promise<object>} le cours créé
 */
export async function createCourse({ title, subject, sourceType, pages = [], images = [] }) {
  const course = {
    id: db.newId(),
    title: title.trim(),
    subject: subject.trim() || 'Divers',
    sourceType, // 'pdf' ou 'photos' (sert à écrire "Page 3" ou "Photo 3")
    createdAt: new Date().toISOString(),
    pages, // [{ n, text }] : texte du cours, page par page
    totalUnits: pages.length || images.length,
    summary: null,
    progress: {}, // avancement des générations par morceaux (reprise possible)
  };
  await db.putMany('images', images.map((blob, i) => ({ id: `${course.id}-${i + 1}`, courseId: course.id, n: i + 1, blob })));
  await db.put('courses', course);
  return course;
}

/** Numéros des images qui n'ont pas encore été transcrites. */
export async function pendingImages(course) {
  const done = new Set(course.pages.map((p) => p.n));
  const imgs = await db.getByIndex('images', 'courseId', course.id);
  return imgs.filter((im) => !done.has(im.n)).sort((a, b) => a.n - b.n);
}

/**
 * Transcrit les images du cours en texte, par lots de BATCH_SIZE.
 * Chaque lot réussi est enregistré aussitôt : en cas de coupure, un nouvel
 * appel reprend là où on s'était arrêté.
 */
export async function transcribeCourse(course, onStatus) {
  const todo = await pendingImages(course);
  const total = course.totalUnits;
  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE);
    const numbers = batch.map((b) => b.n);
    onStatus?.(`Transcription ${course.pages.length + 1}–${course.pages.length + batch.length} sur ${total} (envoi des images)…`);

    const parts = [{ text: transcribePrompt(numbers) }];
    for (const im of batch) {
      parts.push({ text: `Image n°${im.n} :` });
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: await blobToBase64(im.blob) } });
    }
    const res = await generateJSON({
      parts,
      schema: TRANSCRIBE_SCHEMA,
      system: SYSTEM,
      temperature: 0.1,
      onStatus,
      // Vérifie que chaque image du lot a bien été transcrite.
      check: (json) => {
        const got = new Set(json.pages.map((p) => p.n));
        const missing = numbers.filter((n) => !got.has(n));
        return missing.length ? `image(s) ${missing.join(', ')} manquante(s)` : null;
      },
    });
    for (const p of res.pages) {
      if (numbers.includes(p.n) && !course.pages.some((x) => x.n === p.n)) course.pages.push({ n: p.n, text: p.text });
    }
    course.pages.sort((a, b) => a.n - b.n);
    await db.put('courses', course); // sauvegarde après chaque lot
  }
  return course;
}

/** Le cours est-il entièrement transcrit ? */
export function isTranscribed(course) {
  return course.pages.length >= course.totalUnits;
}
