// =====================================================================
// ui.js — Outils d'affichage partagés par tous les écrans
// ---------------------------------------------------------------------
//  esc()          : protège un texte avant de l'insérer dans la page
//  rich()         : Markdown simple + formules KaTeX → HTML
//  mathText()     : texte court (titre, choix, conseil) avec formules KaTeX
//  line()         : réplique au hasard d'un personnage (sans répétition)
//  mascot()       : personnage + bulle de dialogue
//  toast()        : petit message temporaire
//  modal()        : fenêtre par-dessus la page
//  confirmBox()   : demande de confirmation
//  progress()     : chargement IA animé par un personnage
//  showError()    : erreur expliquée par Tidiane
//  sourceHtml()   : passage source d'une fiche/question (fiabilité)
// =====================================================================

import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play, setExpression } from './character.js';
import { getProfileSync } from '../core/game.js';
import { isCreator, creatorName } from '../core/creator.js';
import { voice, playSfx } from './sfx.js';
import { normalizeMath } from '../core/mathfix.js';

/** Échappe les caractères spéciaux HTML (sécurité : évite l'injection de code). */
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------
// Markdown + formules
// ---------------------------------------------------------------------

// KaTeX (formules, ~270 Ko) n'est PAS chargé au démarrage : il arrive à la demande
// (ou en arrière-plan quand l'appli est au repos, voir preloadMath). En attendant,
// la formule s'affiche en texte, puis elle est remplacée automatiquement.
let katex = null;
let katexLoading = null;
const rawMath = (tex, display) => esc(display ? `$$${tex}$$` : `$${tex}$`);
function mathHTML(tex, display) {
  try {
    return katex.renderToString(tex, { displayMode: display, throwOnError: false, output: 'html' });
  } catch {
    return `<code>${rawMath(tex, display)}</code>`;
  }
}

/** Charge KaTeX (une seule fois), puis met en forme les formules en attente. */
export function preloadMath() {
  katexLoading ||= import('./math.js').then((m) => {
    katex = m.default;
    document.querySelectorAll('.math-pending').forEach((el) => { el.outerHTML = mathHTML(el.dataset.tex, el.dataset.display === '1'); });
  }).catch(() => { katexLoading = null; });
  return katexLoading;
}

/** Affiche une formule LaTeX avec KaTeX (ou le texte brut en attendant / en cas d'erreur). */
function renderMath(tex, display) {
  if (katex) return mathHTML(tex, display);
  preloadMath();
  return `<span class="math-pending" data-tex="${esc(tex)}" data-display="${display ? 1 : 0}">${rawMath(tex, display)}</span>`;
}

/** Mise en forme dans une ligne : gras, italique. */
function inline(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
}

/**
 * Convertit du Markdown simple + LaTeX en HTML sûr.
 * Gère : titres (#), listes (- ou 1.), tableaux (| a | b |), **gras**,
 * *italique*, `code`, formules $...$ et $$...$$.
 */
export function rich(text) {
  const saved = []; // morceaux mis de côté (formules, code) pour ne pas les abîmer
  const keep = (html) => `\u0000${saved.push(html) - 1}\u0000`;

  // 0. Notation correcte : LaTeX abîmé réparé, u(n) → u_n, maths hors formule entre $…$
  //    (vaut aussi pour les fiches et résumés enregistrés avant la correction).
  let s = normalizeMath(text);
  // 1. On met de côté les formules et le code.
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => keep(renderMath(t.trim(), true)));
  s = s.replace(/\\\[([\s\S]+?)\\\]/g, (_, t) => keep(renderMath(t.trim(), true)));
  s = s.replace(/\\\((.+?)\\\)/g, (_, t) => keep(renderMath(t, false)));
  s = s.replace(/\$([^$\n]+?)\$/g, (_, t) => keep(renderMath(t, false)));
  s = s.replace(/`([^`\n]+)`/g, (_, t) => keep(`<code>${esc(t)}</code>`));

  // 2. On protège le reste du texte.
  s = esc(s);

  // 3. On traite ligne par ligne (titres, listes, tableaux, paragraphes).
  const out = [];
  let list = null; // 'ul' ou 'ol' si on est dans une liste
  let table = null; // lignes du tableau en cours
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  const closeTable = () => {
    if (!table) return;
    const rows = table.filter((r) => !/^\s*\|?\s*:?-{2,}/.test(r));
    const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => inline(c.trim()));
    const head = cells(rows[0]).map((c) => `<th>${c}</th>`).join('');
    const body = rows.slice(1).map((r) => `<tr>${cells(r).map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
    out.push(`<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`);
    table = null;
  };

  for (const raw of s.split('\n')) {
    const ln = raw.trimEnd();
    if (/^\s*\|.*\|\s*$/.test(ln)) { closeList(); (table ||= []).push(ln); continue; }
    closeTable();
    let m;
    if (!ln.trim()) { closeList(); continue; }
    if ((m = ln.match(/^\s*(#{1,6})\s+(.*)$/))) {
      closeList();
      const level = Math.min(6, m[1].length + 2); // #→h3, ##→h4…
      out.push(`<h${level}>${inline(m[2])}</h${level}>`);
    } else if ((m = ln.match(/^\s*[-*•]\s+(.*)$/))) {
      if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul'; }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = ln.match(/^\s*\d+[.)]\s+(.*)$/))) {
      if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol'; }
      out.push(`<li>${inline(m[1])}</li>`);
    } else {
      closeList();
      out.push(`<p>${inline(ln)}</p>`);
    }
  }
  closeList();
  closeTable();

  // 4. On remet les formules et le code.
  return out.join('\n').replace(/\u0000(\d+)\u0000/g, (_, i) => saved[i]);
}

/**
 * Texte COURT (titre de notion, choix, conseil, question manquée…) : formules KaTeX
 * + gras/italique, sans paragraphes ni listes. À utiliser au lieu de esc() pour tout
 * texte écrit par l'IA qui peut contenir des maths.
 */
export function mathText(text) {
  const saved = [];
  const keep = (html) => `\u0000${saved.push(html) - 1}\u0000`;
  let s = normalizeMath(text);
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => keep(renderMath(t.trim(), false)));
  s = s.replace(/\\\[([\s\S]+?)\\\]/g, (_, t) => keep(renderMath(t.trim(), false)));
  s = s.replace(/\\\((.+?)\\\)/g, (_, t) => keep(renderMath(t, false)));
  s = s.replace(/\$([^$\n]+?)\$/g, (_, t) => keep(renderMath(t, false)));
  return inline(esc(s)).replace(/\s*\n\s*/g, ' ').replace(/\u0000(\d+)\u0000/g, (_, i) => saved[i]);
}

// ---------------------------------------------------------------------
// Répliques des personnages
// ---------------------------------------------------------------------
const recent = {}; // dernières répliques utilisées (pour éviter les répétitions)

/**
 * Renvoie une réplique au hasard d'un personnage pour une situation,
 * en évitant de répéter les dernières. {prenom} est remplacé.
 */
export function line(charId, situation) {
  const ch = CHARACTERS[charId];
  // Mode Créateur : répliques spéciales pour MLT (section "createur" de characters.js).
  const creator = isCreator() && ch?.createur?.[situation];
  const list = (creator || ch?.lines?.[situation] || ch?.lines?.arrivee || []);
  if (!list.length) return '';
  const key = `${creator ? 'c:' : ''}${charId}:${situation}`;
  const used = (recent[key] ||= []);
  const free = list.map((_, i) => i).filter((i) => !used.includes(i));
  const i = free[Math.floor(Math.random() * free.length)];
  used.push(i);
  if (used.length > Math.min(6, list.length - 1)) used.shift();
  return list[i].replace(/\{prenom\}/g, displayName());
}

/** Nom affiché de l'utilisateur ("MLT" en Mode Créateur). */
export function displayName() {
  return isCreator() ? creatorName() : (getProfileSync()?.name || 'toi');
}

/**
 * Personnage + bulle de dialogue (HTML).
 * @param {string} charId
 * @param {object} o { situation, text, expression, size, aura, cls }
 */
export function mascot(charId, o = {}) {
  const ch = CHARACTERS[charId];
  const text = o.text ?? line(charId, o.situation || 'arrivee');
  return `<div class="mascot ${o.cls || ''}" style="--c:${ch.color}">
    ${characterHTML(charId, { expression: o.expression || 'neutre', size: o.size || 110, aura: o.aura })}
    <div class="bubble"><span class="who">${esc(ch.name)}</span><span class="say">${esc(text)}</span></div>
  </div>`;
}

/**
 * Fait parler un personnage déjà affiché dans un bloc .mascot :
 * change sa réplique, son expression, et joue une animation.
 */
export function say(container, situation, { expression, anim = 'bounce', text } = {}) {
  const box = container?.querySelector?.('.mascot') || container;
  if (!box) return;
  const chEl = box.querySelector('.ch');
  const bubble = box.querySelector('.bubble');
  const id = chEl?.dataset.ch;
  if (bubble && id) {
    bubble.querySelector('.say').textContent = text ?? line(id, situation);
    playSfx('bubble');
    voice(id);
    bubble.style.animation = 'none';
    void bubble.offsetWidth;
    bubble.style.animation = '';
  }
  if (chEl) {
    if (expression) setExpression(chEl, expression);
    if (anim) play(chEl, anim);
  }
}

// ---------------------------------------------------------------------
// Messages, fenêtres, chargements
// ---------------------------------------------------------------------

/** Affiche un petit message temporaire. type : 'info' | 'error' | 'ok' */
export function toast(message, type = 'info', ms = 3500) {
  let box = document.getElementById('toasts');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toasts';
    document.body.appendChild(box);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  box.appendChild(el);
  // Au plus 2 messages à la fois (sinon ils cachent l'écran).
  while (box.children.length > 2) box.firstElementChild.remove();
  setTimeout(() => el.remove(), type === 'error' ? ms * 2 : ms);
}

/**
 * Ouvre une fenêtre modale. `html` = contenu. Renvoie { el, close }.
 * Les boutons avec l'attribut data-close ferment la fenêtre.
 */
export function modal(html, { onClose, locked = false } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.innerHTML = `<div class="modal" role="dialog">${html}</div>`;
  document.body.appendChild(wrap);
  const close = () => { wrap.remove(); onClose?.(); };
  wrap.addEventListener('click', (e) => {
    if ((!locked && e.target === wrap) || e.target.closest('[data-close]')) close();
  });
  return { el: wrap.querySelector('.modal'), close };
}

/** Demande une confirmation. Renvoie une Promise<boolean>. */
export function confirmBox(message, okLabel = 'Confirmer') {
  return new Promise((resolve) => {
    let answered = false;
    const m = modal(`<p style="font-weight:600">${esc(message)}</p>
      <div class="row end" style="margin-top:14px"><button class="btn ghost small" data-close>Annuler</button>
      <button class="btn danger small" id="cf-ok">${esc(okLabel)}</button></div>`,
    { onClose: () => { if (!answered) resolve(false); } });
    m.el.querySelector('#cf-ok').onclick = () => { answered = true; m.close(); resolve(true); };
  });
}

/**
 * Chargement IA animé par le personnage de l'écran.
 * Sa réplique change toutes les 4 s. Si un souci réseau/quota survient
 * (message commençant par 📡 ⏳ 🛠️ 🔁), Tidiane prend le relais.
 * Renvoie { set(texte), done() }.
 */
export function progress(title, charId = 'kai') {
  const ch = CHARACTERS[charId];
  const m = modal(`
    <div class="loader" style="--c:${ch.color}">
      <h3 class="display">${esc(title)}</h3>
      <div class="ld-char">${characterHTML(charId, { expression: 'concentration', size: 130 })}</div>
      <div class="bubble"><span class="who">${esc(ch.name)}</span><span class="say">${esc(line(charId, 'attente'))}</span></div>
      <div class="dots-loader"><i></i><i></i><i></i></div>
      <div class="status" id="pg-status">C'est parti…</div>
      <p class="tiny dim">Garde l'appli ouverte pendant l'opération.</p>
    </div>`, { locked: true });
  let who = charId;
  const bubble = m.el.querySelector('.bubble');
  const rotate = setInterval(() => {
    bubble.querySelector('.say').textContent = line(who, 'attente');
  }, 4000);

  /** Change le personnage affiché (ex. Tidiane pendant un souci réseau). */
  const swap = (id, expression) => {
    if (who === id) return;
    who = id;
    const c = CHARACTERS[id];
    m.el.querySelector('.loader').style.setProperty('--c', c.color);
    m.el.querySelector('.ld-char').innerHTML = characterHTML(id, { expression, size: 130 });
    bubble.querySelector('.who').textContent = c.name;
    bubble.querySelector('.say').textContent = line(id, 'arrivee');
  };
  const status = m.el.querySelector('#pg-status');
  return {
    set: (t) => {
      status.textContent = t;
      if (/^[📡⏳🛠🔁]/u.test(t)) swap('tidiane', 'encouragement');
      else swap(charId, 'concentration');
    },
    done: () => { clearInterval(rotate); m.close(); },
  };
}

/**
 * Explique une erreur avec Tidiane (fenêtre avec son perso).
 * `retry` (optionnel) : fonction appelée par le bouton "Réessayer".
 */
export function showError(e, retry) {
  console.error(e);
  const msg = e?.message || String(e);
  const m = modal(`
    <div class="center" style="--c:${CHARACTERS.tidiane.color}">
      ${characterHTML('tidiane', { expression: 'encouragement', size: 120 })}
      <div class="bubble top" style="margin:10px 0 12px;text-align:left"><span class="who">Tidiane</span>${esc(line('tidiane', 'erreur'))}</div>
      <p style="font-weight:700;font-size:1.02rem">${esc(msg)}</p>
      <div class="row" style="justify-content:center;margin-top:14px">
        ${retry ? '<button class="btn" id="err-retry">🔁 Réessayer</button>' : ''}
        <button class="btn ghost" data-close>OK</button>
      </div>
    </div>`);
  const ch = m.el.querySelector('.ch');
  setTimeout(() => play(ch, 'signature'), 400);
  const r = m.el.querySelector('#err-retry');
  if (r) r.onclick = () => { m.close(); retry(); };
}

// ---------------------------------------------------------------------
// Passages sources (fiabilité)
// ---------------------------------------------------------------------

/** Simplifie un texte pour comparer (minuscules, sans accents ni ponctuation). */
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Vérifie si la citation existe vraiment dans le cours.
 * Renvoie 'exact' (trouvée), 'proche' (la plupart des mots y sont) ou 'absente'.
 */
export function checkQuote(course, source) {
  if (!source?.quote) return 'absente';
  const q = norm(source.quote);
  const page = course.pages.find((p) => p.n === source.page);
  const texts = course.pages.map((p) => p.text);
  if (texts.some((t) => norm(t).includes(q))) return 'exact';
  const words = q.split(' ').filter((w) => w.length > 2);
  const pageWords = new Set(norm(page ? page.text : texts.join(' ')).split(' '));
  const found = words.filter((w) => pageWords.has(w)).length;
  return words.length && found / words.length >= 0.7 ? 'proche' : 'absente';
}

/** HTML du passage source : Page 3 + « citation » + indicateur de vérification. */
export function sourceHtml(course, source) {
  if (!source) return '';
  const label = course.sourceType === 'photos' ? 'Photo' : 'Page';
  const badge = {
    exact: '<span class="chip ok" title="Citation retrouvée dans le cours">✓ vérifiée</span>',
    proche: '<span class="chip warn" title="Citation proche du cours">≈ proche</span>',
    absente: '<span class="chip bad" title="Citation introuvable dans le cours : méfie-toi">⚠ non retrouvée</span>',
  }[checkQuote(course, source)];
  return `<div class="source">📖 <strong>${label} ${esc(source.page)}</strong> ${badge}
    <blockquote>« ${esc(source.quote)} »</blockquote></div>`;
}

// ---------------------------------------------------------------------
// Divers
// ---------------------------------------------------------------------

/** Formate une date ISO en français (ex. 12 mars 2026). */
export function frDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

/** Couleur néon attribuée à une matière (toujours la même pour une matière). */
export function subjectColor(subject) {
  let h = 0;
  for (const c of String(subject)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `var(--subject-${(h % 7) + 1})`;
}

/** Emoji décoratif selon la matière (juste pour le style). */
export function subjectEmoji(subject) {
  const s = String(subject).toLowerCase();
  const map = [[/math|algèbre|analyse|proba|stat/, '📐'], [/phys/, '⚡'], [/chim/, '🧪'], [/algo|prog|info|code|java|python|web|réseau|base de/, '💻'],
    [/bio|svt/, '🧬'], [/hist|géo/, '🌍'], [/anglais|english|langue|français|lettre/, '📖'], [/éco|gestion|compta|droit/, '📊']];
  return (map.find(([re]) => re.test(s)) || [null, '✨'])[1];
}
