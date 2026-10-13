// =====================================================================
// illustration/prompt.mjs — Analyse d'une case, choix des références, construction du prompt
// ---------------------------------------------------------------------
// Règles (docs/methode-illustration.md) :
//   - blocs STYLE, REALISM LOCK, SCENE LOCK, CHARACTER LOCK, EYE-LINE, HEIGHT/AGE LOCK,
//     PHYSICAL LOGIC, DO NOT, en anglais ;
//   - JAMAIS la référence d'un personnage absent de la case (sinon Gemini fait des clones) ;
//   - TOUJOURS au moins une case déjà illustrée du même chapitre comme référence de STYLE
//     (sinon Gemini part en photoréalisme).
// =====================================================================

import fs from 'node:fs';
import path from 'node:path';
import { PERSONNAGES, HEROS, DECORS, DECORS_COURT, ABSTRAIT, REF_DIR, IMG_EXT, chapterImages, caseImage, ROOT, decorRefDefaut } from './config.mjs';

/** Description de la case sans les marqueurs [ILLUSTRATION], [DESSIN APPLI]… */
export const cleanAction = (a) => String(a || '').replace(/\[[A-ZÉÈ ]+\]\s*/g, '').trim();

/**
 * Personnages VISIBLES dans la case : ceux de panel.chars + ceux nommés dans la description,
 * sauf ceux dits « hors champ ». Kaï devient « kai + kai-bande » si la description parle de bandage.
 */
export function detectCharacters(panel, extra = '') {
  const text = `${panel.action || ''} ${extra}`;
  const ids = new Set();
  for (const c of panel.chars || []) {
    const id = c.of || c.id; // { id: 'poing', of: 'kai' } = la main de Kaï
    if (PERSONNAGES[id]) ids.add(id);
  }
  for (const [id, p] of Object.entries(PERSONNAGES)) if (p.re && p.re.test(text)) ids.add(id);
  // « … Nia (hors champ) », « vers Kaï et Mory, hors champ » : si TOUTES les mentions d'un
  // personnage sont suivies de « hors champ », il n'est pas dans l'image (même s'il est dans chars).
  for (const id of [...ids]) {
    const p = PERSONNAGES[id];
    if (!p.re) continue;
    const all = text.match(new RegExp(p.re.source, 'gi')) || [];
    const off = text.match(new RegExp(`${p.re.source}[^.;]{0,40}?hors[ -]champ`, 'gi')) || [];
    if (all.length && off.length >= all.length) ids.delete(id);
  }
  const list = [...ids].sort((a, b) => HEROS.indexOf(a) - HEROS.indexOf(b));
  if (list.includes('kai') && /band(é|e|age)/i.test(text)) list.splice(list.indexOf('kai') + 1, 0, 'kai-bande');
  return list;
}

/** Décor de la case : bg.id, ou celui d'une case voisine si le fond est abstrait (aplat, flash). */
export function detectDecor(chapter, pIdx, cIdx) {
  const page = chapter.pages[pIdx];
  const own = page.panels[cIdx]?.bg?.id;
  if (own && !ABSTRAIT.includes(own) && DECORS[own] !== undefined) return own;
  const around = [];
  page.panels.forEach((q, i) => { if (q.bg?.id && DECORS[q.bg.id] !== undefined) around.push([Math.abs(i - cIdx), q.bg.id]); });
  if (around.length) return around.sort((a, b) => a[0] - b[0])[0][1];
  for (let d = 1; d < chapter.pages.length; d++) {
    for (const pi of [pIdx - d, pIdx + d]) {
      const q = chapter.pages[pi]?.panels?.find((x) => DECORS[x.bg?.id] !== undefined);
      if (q) return q.bg.id;
    }
  }
  return own || null;
}

// ---------------------------------------------------------------------
// Fichiers de référence
// ---------------------------------------------------------------------
const listImages = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => IMG_EXT.test(f)).sort().map((f) => path.join(dir, f)) : []);

/** Références d'un personnage : references/personnages/<nom>.png, <nom>-2.png… (2 au plus). */
export function characterRefs(id) {
  const base = PERSONNAGES[id]?.ref || id;
  const re = new RegExp(`^${base}(-\\d+)?\\.(png|jpe?g|webp)$`, 'i');
  return listImages(path.join(REF_DIR, 'personnages')).filter((f) => re.test(path.basename(f))).slice(0, 2);
}

/**
 * Références d'un décor : d'abord chapitre-N-<décor>*, sinon <décor>* (2 au plus), sinon la case
 * illustrée choisie par défaut pour ce lieu (DECOR_REF_DEFAUT, config.mjs).
 */
export function decorRefs(decor, n) {
  if (!decor) return [];
  const all = listImages(path.join(REF_DIR, 'decors'));
  const own = all.filter((f) => path.basename(f).toLowerCase().startsWith(`chapitre-${n}-${decor}`));
  const gen = all.filter((f) => new RegExp(`^${decor}(-\\d+)?\\.`, 'i').test(path.basename(f)));
  const found = (own.length ? own : gen).slice(0, 2);
  if (found.length) return found;
  const def = decorRefDefaut(decor);
  return def ? [def] : [];
}

/**
 * Case(s) déjà illustrée(s) du même chapitre, comme référence de STYLE : la plus proche
 * (même page d'abord). `exclude` = la case traitée (sa propre image n'est pas une référence de style).
 * Repli sur le chapitre précédent si le chapitre n'a encore aucune image (avec un avertissement).
 */
export function styleRefs(n, p, c, count = 1, memeDecor = null, prefer = []) {
  // Même décor d'abord (memeDecor(p, c) → vrai), puis la plus proche.
  const dist = (x) => (memeDecor && !memeDecor(x.p, x.c) ? 10000 : 0) + Math.abs(x.p - p) * 100 + Math.abs(x.c - c);
  let pool = chapterImages(n).filter((x) => !(x.p === p && x.c === c));
  let warn = null;
  if (!pool.length) {
    for (let k = n - 1; k >= 1 && !pool.length; k--) {
      pool = chapterImages(k);
      if (pool.length) warn = `aucune case du chapitre ${n} n'est encore illustrée : référence de style prise dans le chapitre ${k}`;
    }
    // Chapitre sans image : la case de référence du décor (si elle existe) passe en premier,
    // pour que la référence de style montre aussi le bon lieu.
    const pref = prefer.map((f) => path.resolve(f));
    const extra = pref.filter((f) => fs.existsSync(f) && !pool.some((x) => path.resolve(x.file) === f)).map((file) => ({ p: 0, c: 0, file }));
    if (pref.length) {
      const first = [...pool.filter((x) => pref.includes(path.resolve(x.file))), ...extra];
      if (first.length) {
        const others = pool.filter((x) => !pref.includes(path.resolve(x.file))).sort((a, b) => Math.abs(a.p - p) * 100 + Math.abs(a.c - c) - (Math.abs(b.p - p) * 100 + Math.abs(b.c - c)));
        if (!warn) warn = `aucune case du chapitre ${n} n'est encore illustrée`;
        warn += ` (en premier : ${rel(first[0].file)}, même décor)`;
        return { files: [...first, ...others].slice(0, count).map((x) => x.file), warn };
      }
    }
  }
  return { files: pool.sort((a, b) => dist(a) - dist(b)).slice(0, count).map((x) => x.file), warn };
}

/**
 * Cases déjà illustrées d'un AUTRE chapitre avec le même décor (ex. la corniche du chapitre 1) :
 * servent de référence de décor quand references/decors/ n'a rien pour ce lieu.
 */
export async function decorPanelsElsewhere(decor, n, load, max = 1) {
  if (!decor || ABSTRAIT.includes(decor)) return [];
  const out = [];
  for (let k = 1; k <= 12 && out.length < max; k++) {
    if (k === n) continue;
    let ch; try { ch = await load(k); } catch { continue; }
    for (const img of chapterImages(k)) {
      if (ch.pages[img.p - 1]?.panels?.[img.c - 1]?.bg?.id === decor) { out.push(img.file); if (out.length >= max) break; }
    }
  }
  return out;
}

// ---------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------
const STYLE = `STYLE
Modern shonen manga illustration: thick black ink outlines, cel-shading, saturated colors, readable realistic action, no cute or chibi style.
Copy EXACTLY the drawing style, line weight, shading and color palette of the attached finished comic panel(s) used as style references.
16:9 landscape image, the subject centered: faces, hands and key objects stay in the central third.
Leave calm areas (wall, sky, floor, ceiling) around the subject.`;

const REALISM = `REALISM LOCK
Same modern shonen manga style as the reference: thick black outlines, cel-shading.
No photorealism, no photograph look, no 3D render, no painterly style.
Realistic proportions and physics: real weight, real shadows, objects rest on surfaces, hands have five fingers, no deformed anatomy.
Light source and shadows consistent with the time of day.`;

const AGE = `HEIGHT/AGE LOCK
Every character is a young adult about 20 years old (university student): adult faces and adult body proportions, not children, not teenagers, no big round child cheeks.
Main characters have about the same height; natural proportions, no giant foreground hand or head.`;

const PHYSICS = `PHYSICAL LOGIC
Everything rests on a surface and casts a coherent shadow; nothing floats unless the scene says so.`;

const DONOT = `DO NOT
No text of any kind: no letters, no words, no numbers, no captions, no writing on signs, screens, books or clothes, no logos, no watermark, no signature.
No speech balloons, no thought balloons, no empty white shapes, no white boxes, no blank white areas.
No panel borders, no comic page layout, no split screen: one single picture.
No extra characters beyond those described, no duplicated character, no twin, no reflection of a character.
Nobody looks at the camera.`;

/**
 * Début d'une description, court : les phrases (≥ 60 signes en tout), coupé à ≤ max signes
 * sur une virgule / un point-virgule si possible. Sans point final (ajouté par l'appelant).
 */
export function premierePhrase(txt, max = 150) {
  const t = String(txt || '').replace(/\s+/g, ' ').trim();
  const phrases = t.match(/[^.!?…]+[.!?…]*(?:\s+|$)/g) || [t];
  let out = '';
  for (const ph of phrases) { out = `${out} ${ph}`.trim(); if (out.length >= 60) break; }
  if (out.length > max) {
    const cut = out.slice(0, max);
    const k = Math.max(cut.lastIndexOf(';'), cut.lastIndexOf(','));
    out = (k > max * 0.5 ? cut.slice(0, k) : cut.replace(/\s+\S*$/, '')).trim();
  }
  return out.replace(/[\s.;,:!?…]+$/, '');
}

/** Les personnages d'une case, en quelques mots visuels : « Kaï (a young man …), Mory (…) ». */
export function personnesCourt(chars) {
  const vus = chars.filter((id) => id !== 'kai-bande' && id !== 'oubli');
  const txt = vus.map((id) => {
    const c = id === 'kai' && chars.includes('kai-bande') ? PERSONNAGES['kai-bande'].court : PERSONNAGES[id].court;
    return /^(l[’']|un |une |la )/i.test(PERSONNAGES[id].nom) ? c : `${PERSONNAGES[id].nom} (${c})`;
  });
  if (chars.includes('oubli')) txt.push(PERSONNAGES.oubli.court);
  return txt.join(', ');
}

/**
 * Résumé court et VISUEL d'une case, pour la reconnaître parmi les images jointes :
 * « Kaï (…) and Mory (…) in the university library reading room; scene: "<début de la scène>" ».
 */
export function resumeCase({ chars, decor, texte }) { // texte vide : sans la scène (case de style)
  const gens = personnesCourt(chars);
  const lieu = decor && DECORS_COURT[decor] ? `the ${DECORS_COURT[decor]}` : '';
  const ph = premierePhrase(texte);
  const base = [gens, lieu].filter(Boolean).join(' in ');
  return `${base}${ph ? `${base ? '; scene: ' : 'scene: '}“${ph}”` : ''}`.trim();
}

/**
 * Description d'une image jointe par son CONTENU (jamais par son numéro : les images ne restent
 * pas dans l'ordre quand on les joint dans AI Studio / Gemini). ref = { kind, resume, charId, decor }.
 */
export function decrireRef(r) {
  if (r.kind === 'edit') return `the 16:9 comic panel showing ${r.resume} (the image to EDIT)`;
  if (r.kind === 'style' && r.decor) return `another finished panel of the same comic (a DIFFERENT scene) showing the ${DECORS_COURT[r.decor] || r.decor} — use it for the drawing style AND for the look of this place (layout, objects, light, orientation), never for its characters, poses or composition`;
  if (r.kind === 'style') return `another finished panel of the same comic, a DIFFERENT scene${r.pourRetouche ? ' from the panel to edit' : ''}${r.resume ? `, showing ${r.resume}` : ''} — use it for the drawing style only, never for its content, characters, poses or composition`;
  if (r.kind === 'character') {
    const p = PERSONNAGES[r.charId];
    const c = r.charId === 'kai' && r.variante === 'kai-bande' ? PERSONNAGES['kai-bande'].court : p.court;
    return `the character sheet of ${c} (${p.nom.replace(/ \(.*\)/, '')}) on a plain background: use it for the face, hair and clothes of ${p.nom.replace(/ \(.*\)/, '')} only${p.refNote ? `, ${p.refNote}` : ''}, ignoring its pose and framing`;
  }
  if (r.kind === 'decor') return `the empty ${DECORS_COURT[r.decor] || r.decor || 'setting'} with no people: use it for the layout and objects of the place only, drawn in the manga style of the style panel`;
  return 'an extra reference image given by the author';
}

/** Légende des images jointes : par contenu, avec la phrase « dans n'importe quel ordre ». */
function legend(refs) {
  if (!refs.length) return '';
  return `ATTACHED IMAGES\nThe attached images may be in any order: identify each one by its content.\n${refs.map((r) => `- ${r.role}`).join('\n')}`;
}

function characterLock(chars) {
  if (!chars.length) return 'CHARACTER LOCK\nNo named character appears in this picture.';
  const lines = chars.map((id) => PERSONNAGES[id].lock);
  const main = chars.filter((id) => id !== 'kai-bande' && id !== 'oubli');
  return `CHARACTER LOCK\n${lines.join('\n')}\nExactly ${main.length} described character(s): ${main.map((id) => PERSONNAGES[id].nom).join(', ')}. Each one appears ONCE. Same face as in their character sheet when one is attached.`;
}

const EYELINE = `EYE-LINE
Each character looks where the SCENE says: say it with the direction of the head AND of the pupils.
When two characters talk, they look at each other's eyes. Nobody looks at the camera.
Glasses are transparent: both eyes and pupils visible through the lenses.`;

/**
 * Prompt de GÉNÉRATION d'une case.
 * @param {object} o { scene (texte de la case, en anglais si traduit), sceneLang, chars, decor, refs, consigne }
 */
export function buildGenerationPrompt(o) {
  const blocks = [
    `TASK\nDraw ONE comic panel for the manga "Révision IA — La Jeunesse de 2026" (Conakry, Guinea).${o.refs.length ? `\n\n${legend(o.refs)}` : ''}`,
    STYLE,
    REALISM,
    `SCENE LOCK / INVENTORY\n${o.decorLock || (o.decor && DECORS[o.decor]) || 'Use only the setting described in the SCENE.'}\nNothing else added to the setting.`,
    characterLock(o.chars),
    ...(o.chars.length ? [EYELINE] : []),
    AGE,
    `SCENE${o.sceneLang === 'fr' ? ' (written in French: follow it literally)' : ''}\n${o.scene}${o.consigne ? `\nExtra instruction: ${o.consigne}` : ''}`,
    PHYSICS,
    DONOT,
  ];
  return blocks.join('\n\n');
}

/**
 * Prompt de RETOUCHE : COURT (les longs prompts de retouche font renvoyer l'image inchangée).
 * 1) la consigne d'abord, en majuscules ; 2) « change ONLY that » ; 3) l'ordre des images ;
 * 4) un DO NOT minimal ; 5) « le résultat doit être visiblement différent ».
 * Pas de CONTEXT, CHARACTER LOCK, HEIGHT/AGE LOCK ni REALISM LOCK (ils noient la consigne).
 */
export function buildEditPrompt(o) {
  const consigne = String(o.consigne || '').trim().replace(/[.\s]+$/, '');
  const edit = o.refs.find((r) => r.kind === 'edit');
  const autres = o.refs.filter((r) => r.kind !== 'edit');
  const cible = edit?.resume ? ` showing ${edit.resume}` : '';
  const ordre = `The attached images may be in any order: the image to edit is the 16:9 comic panel${cible}.${autres.length
    ? ` The other image${autres.length > 1 ? 's are' : ' is'} reference only (never edit ${autres.length > 1 ? 'them' : 'it'}):\n${autres.map((r) => `- ${r.role}`).join('\n')}`
    : ''}`;
  return [
    `EDIT THIS PANEL: ${consigne.toUpperCase()}.`,
    'Change ONLY that. Keep everything else exactly the same (composition, characters, poses, faces, clothes, background, colors, style, 16:9).',
    ordre,
    'DO NOT add any text, letters, speech bubbles or white shapes.',
    'The result MUST be visibly different from the original in the requested area. Returning the same image is a failure.',
  ].join('\n\n');
}

/** Chemin relatif lisible (affichage). */
export const rel = (f) => path.relative(ROOT, f).replace(/\\/g, '/');
export { caseImage };
