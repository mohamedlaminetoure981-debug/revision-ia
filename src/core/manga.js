// =====================================================================
// manga.js — "Le cours en manga" : génération d'une planche par notion
// ---------------------------------------------------------------------
// - L'IA renvoie UNIQUEMENT le JSON des 4 cases (prompts.js → mangaPrompt).
// - Chaque planche est SAUVEGARDÉE dans le store 'mangas' : on ne la
//   regénère JAMAIS (2e ouverture = instantané, même hors ligne).
// - Identifiant = cours + empreinte de la notion (si le résumé change,
//   une nouvelle planche sera créée pour la nouvelle notion).
// =====================================================================

import * as db from './db.js';
import { generateJSON } from './gemini.js';
import * as P from '../data/prompts.js';
import { unitLabel } from './generate.js';
import { CHARACTERS } from '../data/characters.js';
import { t } from '../i18n/index.js';

/** Petite empreinte (non cryptographique) d'un texte. */
function hash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** Texte de la notion n° `index` du résumé. */
export function notionOf(course, index) {
  const s = course.summary?.[index];
  if (!s) return null;
  return { title: s.title, pages: s.pages || [], text: `${s.title}\n${(s.blocks || []).map((b) => b.text).join('\n')}` };
}

/** Identifiant de cache d'une planche. */
export function mangaId(course, notion) {
  return `${course.id}:${hash(notion.text)}`;
}

/** Planche déjà enregistrée (ou null). */
export async function cachedManga(course, index) {
  const notion = notionOf(course, index);
  return notion ? (await db.get('mangas', mangaId(course, notion))) || null : null;
}

/**
 * Renvoie la planche de la notion (depuis le cache, sinon générée par l'IA).
 * @param {Function} [onPanel] (case, index) : les cases arrivent en direct (streaming)
 */
export async function getOrGenerateManga(course, index, onStatus, onPanel) {
  const notion = notionOf(course, index);
  if (!notion) throw new Error(t('Notion introuvable dans le résumé.'));
  const id = mangaId(course, notion);
  const saved = await db.get('mangas', id);
  if (saved) return saved;
  // On n'envoie que les pages de la notion (plus court = plus rapide).
  const pages = notion.pages.length ? course.pages.filter((p) => notion.pages.includes(p.n)) : course.pages;
  const text = P.courseText(pages.length ? pages : course.pages, unitLabel(course)).slice(0, 14000);
  onStatus?.(t('Nia dessine la planche…'));
  const res = await generateJSON({
    parts: [{ text: P.mangaPrompt(notion.text.slice(0, 2500), text) }],
    schema: P.MANGA_SCHEMA,
    system: P.SYSTEM,
    temperature: 0.8,
    onStatus,
    label: 'manga',
    streamKey: 'panels',
    onItem: (p, idx) => { if (p?.line && idx < 4) onPanel?.(clean(p), idx); },
    check: (json) => (json.panels.length >= 4 ? null : `${t("seulement")} ${json.panels.length} ${t("cases au lieu de 4")}`),
  });
  const strip = {
    id,
    courseId: course.id,
    notion: notion.title,
    title: res.title,
    panels: res.panels.slice(0, 4).map(clean),
    source: res.source,
    createdAt: new Date().toISOString(),
  };
  await db.put('mangas', strip);
  return strip;
}

/** Nettoie une case (perso inconnu → Kaï, textes raccourcis, pas de LaTeX). */
function clean(p) {
  const noTex = (s) => String(s || '').replace(/\$+/g, '').replace(/\\[a-z]+\{?/gi, '').replace(/[{}]/g, '').trim();
  return {
    character: CHARACTERS[p.character] ? p.character : 'kai',
    expression: p.expression || 'neutre',
    line: noTex(p.line).slice(0, 150),
    narration: noTex(p.narration).slice(0, 60),
    sfx: noTex(p.sfx).slice(0, 12),
  };
}

/** Planche de démonstration (Panneau créateur, sans IA). */
export const DEMO_STRIP = {
  title: t('Le théorème de Pythagore'),
  panels: [
    { character: 'ren', expression: 'surprise', line: t('Attends… a² + b² = c² ? Pourquoi pas a + b = c, c’est plus simple !'), narration: t('Au dojo, 3 h du matin…'), sfx: '?!' },
    { character: 'nia', expression: 'reflexion', line: t('Imagine trois carrés collés aux côtés du triangle : les deux petits remplissent pile le grand.'), narration: '', sfx: '' },
    { character: 'awa', expression: 'concentration', line: t('Attention : ça marche SEULEMENT si le triangle est rectangle. c = l’hypoténuse.'), narration: '', sfx: t('TAC!') },
    { character: 'sora', expression: 'celebration', line: t('Triangle rectangle → a² + b² = c². Retenu en 2 secondes. Suivant !'), narration: '', sfx: t('BAM!') },
  ],
};
