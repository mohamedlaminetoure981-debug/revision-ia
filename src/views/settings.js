// =====================================================================
// views/settings.js — Réglages : clé Gemini, modèle, thème, sons,
// vibrations, sauvegarde / import, effacement.
// =====================================================================

import * as db from '../core/db.js';
import { esc, toast, showError, confirmBox, progress, mascot } from '../ui/ui.js';
import { testConnection } from '../core/gemini.js';
import { loadFxPrefs, vibrate, sound } from '../ui/fx.js';
import { applyTheme } from '../main.js';

// Modèles proposés dans la liste (tu peux en taper un autre).
const SUGGESTED_MODELS = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];

export async function render(el) {
  const s = {};
  for (const k of ['apiKey', 'model', 'theme', 'sounds', 'vibration', 'verifyMode']) s[k] = await db.getSetting(k);

  let usage = '';
  try {
    const est = await navigator.storage.estimate();
    usage = `Espace utilisé sur ton téléphone : ${(est.usage / 1048576).toFixed(1)} Mo`;
  } catch { /* non disponible */ }

  const toggle = (id, label, on, hint = '') => `
    <label class="check"><span>${label}${hint ? `<br><span class="tiny muted">${hint}</span>` : ''}</span>
      <span class="switch"><input id="${id}" type="checkbox" ${on ? 'checked' : ''}><span></span></span></label>`;

  el.innerHTML = `
    <div class="screen-head"><a class="back-btn" href="#/profil">←</a><h1>⚙️ Réglages</h1></div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">🔑 Clé API Gemini</h2>
      <p class="small muted">Ta clé reste <strong>uniquement sur ce téléphone</strong> (jamais sur GitHub).
        Obtiens-la gratuitement sur <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>.</p>
      <div class="row nowrap">
        <input id="key" type="password" class="grow" autocomplete="off" placeholder="Colle ta clé ici" value="${esc(s.apiKey)}">
        <button class="icon-btn" id="eye" title="Afficher/masquer">👁️</button>
      </div>
      <label class="field" for="model">Modèle Gemini</label>
      <input id="model" type="text" list="models" value="${esc(s.model)}" autocomplete="off">
      <datalist id="models">${SUGGESTED_MODELS.map((m) => `<option value="${m}">`).join('')}</datalist>
      <p class="tiny muted">Quota épuisé ou modèle qui ne marche plus ? Essaie-en un autre (les « lite » ont souvent plus de quota).
        <a href="https://ai.google.dev/gemini-api/docs/models" target="_blank" rel="noopener">Liste des modèles</a></p>
      ${toggle('verifyMode', '🔍 Mode vérification', s.verifyMode, 'Un 2e appel à l’IA relit les fiches, quiz et corrections en les comparant au cours, et corrige ou signale les erreurs. Plus fiable, mais utilise 2× plus de quota.')}
      <div class="row nowrap" style="margin-top:10px">
        <button class="btn grow" id="save">💾 Enregistrer</button>
        <button class="btn ghost grow" id="test">🧪 Tester</button>
      </div>
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">🎨 Ambiance</h2>
      <div class="seg" id="theme">
        <button data-t="dark" class="${s.theme !== 'light' ? 'active' : ''}">🌙 Sombre</button>
        <button data-t="light" class="${s.theme === 'light' ? 'active' : ''}">☀️ Clair</button>
      </div>
      ${toggle('sounds', '🔊 Sons', s.sounds, 'Petits sons sur les actions (désactivés par défaut)')}
      ${toggle('vibration', '📳 Vibrations', s.vibration, 'Légères vibrations sur les actions clés')}
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">💾 Sauvegarde</h2>
      ${mascot('tidiane', { text: 'Tes données sont seulement sur ce téléphone. Exporte une sauvegarde de temps en temps (Drive, WhatsApp, clé USB…).', size: 70 })}
      <div class="row nowrap" style="margin-top:12px">
        <button class="btn grow" id="export">⬇️ Exporter</button>
        <span class="btn ghost grow filepick">⬆️ Importer<input id="import" type="file" accept="application/json,.json"></span>
      </div>
      <p class="tiny muted">La clé API et les photos ne sont pas dans la sauvegarde. ${usage}</p>
    </div>

    <div class="tile" style="margin-bottom:12px;border-color:var(--bad)">
      <h2 style="margin-top:0">🗑️ Zone dangereuse</h2>
      <button class="btn danger block" id="wipe">Effacer toutes mes données</button>
    </div>
    <p class="tiny dim center">Révision IA · marche hors ligne pour réviser</p>
  `;

  const $ = (q) => el.querySelector(q);
  $('#eye').onclick = () => { $('#key').type = $('#key').type === 'password' ? 'text' : 'password'; };

  async function saveKey() {
    await db.setSetting('apiKey', $('#key').value.trim());
    await db.setSetting('model', $('#model').value.trim() || db.DEFAULT_SETTINGS.model);
  }
  $('#save').onclick = async () => { await saveKey(); toast('Réglages enregistrés ✅', 'ok'); vibrate(); };
  $('#test').onclick = async () => {
    await saveKey();
    const pg = progress('Test de la connexion', 'tidiane');
    try {
      await testConnection();
      pg.done();
      toast('✅ Clé et modèle OK, l’IA est prête !', 'ok');
      sound('good');
    } catch (e) {
      pg.done();
      showError(e);
    }
  };

  el.querySelectorAll('#theme button').forEach((b) => {
    b.onclick = async () => {
      await db.setSetting('theme', b.dataset.t);
      applyTheme(b.dataset.t);
      el.querySelectorAll('#theme button').forEach((x) => x.classList.toggle('active', x === b));
    };
  });
  $('#verifyMode').onchange = async (e) => {
    await db.setSetting('verifyMode', e.target.checked);
    toast(e.target.checked ? '🔍 Mode vérification activé' : 'Mode vérification désactivé', 'ok');
  };
  for (const k of ['sounds', 'vibration']) {
    $(`#${k}`).onchange = async (e) => {
      await db.setSetting(k, e.target.checked);
      await loadFxPrefs();
      if (k === 'sounds') sound('good');
      if (k === 'vibration') vibrate(30);
    };
  }

  // --- Export : télécharge un fichier JSON ---
  $('#export').onclick = async () => {
    try {
      const data = await db.exportAll();
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `revision-ia-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      toast('Sauvegarde téléchargée ✅', 'ok');
    } catch (e) {
      showError(e);
    }
  };

  // --- Import : lit un fichier JSON de sauvegarde ---
  $('#import').onchange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const n = await db.importAll(data);
      toast(`✅ Sauvegarde importée (${n} éléments).`, 'ok');
      setTimeout(() => location.reload(), 800);
    } catch (err) {
      showError(err instanceof SyntaxError ? new Error('Fichier illisible (ce n’est pas un JSON valide).') : err);
    }
  };

  $('#wipe').onclick = async () => {
    if (!(await confirmBox('Effacer TOUS tes cours, fiches, résultats et ta progression ? Exporte une sauvegarde avant !', 'Tout effacer'))) return;
    for (const st of ['courses', 'images', 'cards', 'quizzes', 'results', 'reviews', 'exercises', 'exams']) await db.clear(st);
    await db.setSetting('profile', null);
    location.hash = '#/bienvenue';
    location.reload();
  };
}
