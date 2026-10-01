// =====================================================================
// duel.js — DUELS ENTRE AMIS, SANS SERVEUR
// ---------------------------------------------------------------------
// Tout le quiz (questions, réponses, explications, ton score, ton pseudo,
// ton perso) est COMPRESSÉ dans le lien lui-même, après le # :
//   https://…/revision-ia/#/duel/<données compressées>
// → aucun serveur, aucune base en ligne. Ton ami fait le même quiz SANS
//   clé Gemini, puis voit l'écran de duel et peut te renvoyer le défi.
// Compression : lz-string (marche sur tous les navigateurs, même anciens).
// =====================================================================

import LZString from 'lz-string';
import * as db from './db.js';

const EXPLAIN_MAX = 160; // explications raccourcies : lien plus court
const VERSION = 1;

/** Nettoie un texte (espaces en trop) et le coupe. */
const cut = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);

/**
 * Crée les données d'un duel.
 * @param {object} o { questions, title, subject, score, total, name, charId, reply? }
 *   reply : { id, name, score } quand on RENVOIE un défi reçu
 */
export function makeDuel(o) {
  return {
    v: VERSION,
    i: o.id || Math.random().toString(36).slice(2, 9), // identifiant du duel
    n: cut(o.name, 20), // pseudo
    c: o.charId, // perso choisi
    s: o.score,
    ti: cut(o.title, 60),
    su: cut(o.subject, 30),
    q: o.questions.map((q) => [cut(q.question, 300), q.choices.map((c) => cut(c, 120)), q.correctIndex, cut(q.explanation, EXPLAIN_MAX)]),
    ...(o.reply ? { r: o.reply } : {}),
  };
}

/** Données → morceau d'adresse compressé. */
export function encodeDuel(duel) {
  return LZString.compressToEncodedURIComponent(JSON.stringify(duel));
}

/** Morceau d'adresse → données (ou null si le lien est abîmé). */
export function decodeDuel(code) {
  try {
    const d = JSON.parse(LZString.decompressFromEncodedURIComponent(code) || 'null');
    if (!d || !Array.isArray(d.q) || !d.q.length) return null;
    d.questions = d.q.map(([question, choices, correctIndex, explanation]) => ({ question, choices, correctIndex, explanation }));
    d.total = d.questions.length;
    return d;
  } catch {
    return null;
  }
}

/** Lien complet à partager. */
export function duelLink(duel) {
  return `${location.origin}${import.meta.env.BASE_URL}#/duel/${encodeDuel(duel)}`;
}

/** Message accrocheur pour WhatsApp. */
export function duelMessage(duel) {
  const t = duel.ti || duel.su || 'ce quiz';
  const total = duel.q.length;
  if (duel.r) {
    return duel.s > duel.r.score
      ? `Revanche prise : ${duel.s}/${total} contre ton ${duel.r.score}/${total} sur « ${t} » 😎 À toi de jouer !`
      : `J'ai fait ${duel.s}/${total} sur « ${t} »… Ton ${duel.r.score}/${total} tient encore. Pour l'instant 😤`;
  }
  const pct = duel.s / total;
  return pct >= 0.8 ? `Je t'ai mis ${duel.s}/${total} sur « ${t} » 😏 Fais mieux.`
    : pct >= 0.5 ? `${duel.s}/${total} sur « ${t} ». Tu crois pouvoir me battre ? ⚔️`
      : `J'ai fait ${duel.s}/${total} sur « ${t} »… même toi tu peux faire mieux 😅 Prouve-le !`;
}

/**
 * Partage le duel : menu Partager du téléphone, sinon WhatsApp (wa.me).
 * Mémorise le duel envoyé (pour reconnaître la réponse de l'ami).
 */
export async function shareDuel(duel) {
  const url = duelLink(duel);
  const text = duelMessage(duel);
  const sent = (await db.getSetting('duelsSent')) || {};
  sent[duel.i] = { score: duel.s, date: new Date().toISOString(), title: duel.ti };
  await db.setSetting('duelsSent', sent);
  if (navigator.share) {
    try { await navigator.share({ text: `${text}\n${url}` }); return 'shared'; } catch (e) { if (e?.name === 'AbortError') return 'cancelled'; }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
  return 'whatsapp';
}
