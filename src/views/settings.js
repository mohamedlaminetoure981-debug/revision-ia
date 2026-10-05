// =====================================================================
// views/settings.js — Réglages : clé Gemini, modèle, thème, sons,
// vibrations, sauvegarde / import, effacement.
// =====================================================================

import * as db from '../core/db.js';
import { esc, toast, showError, confirmBox, progress, mascot } from '../ui/ui.js';
import { testConnection, MODEL_CHAIN } from '../core/gemini.js';
import { loadQuota, resetTimeText } from '../core/quota.js';
import { loadFxPrefs, vibrate, sound } from '../ui/fx.js';
import { applyTheme } from '../main.js';
import { openInstall, isInstalled } from '../ui/install.js';
import { checkCode, enableCreator, disableCreator, isCreator, creatorName, setCreatorName } from '../core/creator.js';
import { creatorWelcome } from '../ui/creator-scene.js';
import { refresh } from '../main.js';
import { t, LANGS, getLang, setLang } from '../i18n/index.js';

// Modèles proposés dans la liste (tu peux en taper un autre).
const SUGGESTED_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash-lite'];

export async function render(el) {
  const s = {};
  for (const k of ['apiKey', 'model', 'theme', 'sounds', 'vibration', 'verifyMode', 'council', 'volume', 'genLang']) s[k] = await db.getSetting(k);

  // Compteur du jour : demandes réussies par modèle, modèles épuisés.
  const quota = await loadQuota();
  const primary = s.model || db.DEFAULT_SETTINGS.model;
  const models = [primary, ...MODEL_CHAIN.filter((m) => m !== primary)];
  for (const m of Object.keys(quota.counts)) if (!models.includes(m)) models.push(m);
  const totalReq = Object.values(quota.counts).reduce((a, b) => a + b, 0);
  const allOut = models.every((m) => quota.exhausted[m]);

  let usage = '';
  try {
    const est = await navigator.storage.estimate();
    usage = `${t("Espace utilisé sur ton téléphone :")} ${(est.usage / 1048576).toFixed(1)} Mo`;
  } catch { /* non disponible */ }

  const toggle = (id, label, on, hint = '') => `
    <label class="check"><span>${label}${hint ? `<br><span class="tiny muted">${hint}</span>` : ''}</span>
      <span class="switch"><input id="${id}" type="checkbox" ${on ? 'checked' : ''}><span></span></span></label>`;

  el.innerHTML = `
    <div class="screen-head"><a class="back-btn" href="#/profil">←</a><h1>${t("⚙️ Réglages")}</h1></div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">${t('🌍 Langue')}</h2>
      <div class="seg" id="lang">${Object.entries(LANGS).map(([code, name]) => `<button data-l="${code}" lang="${code}" class="${code === getLang() ? 'active' : ''}">${name}</button>`).join('')}</div>
      <label class="field">${t('🤖 Langue du contenu créé par l’IA')}</label>
      <div class="seg" id="genLang">
        <button data-v="app" class="${s.genLang !== 'cours' ? 'active' : ''}">${t('Langue de l’appli')}</button>
        <button data-v="cours" class="${s.genLang === 'cours' ? 'active' : ''}">${t('Langue du cours')}</button>
      </div>
      <p class="tiny muted">${t('Résumés, fiches, quiz, corrections et explications sont créés directement dans cette langue (sans demande en plus).')}</p>
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">${t("🔑 Clé API Gemini")}</h2>
      <p class="small muted">${t("Ta clé reste")} <strong>${t("uniquement sur ce téléphone")}</strong> ${t("(jamais sur GitHub).\n        Obtiens-la gratuitement sur")} <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">${t("Google AI Studio")}</a>.</p>
      <div class="row nowrap">
        <input id="key" type="password" class="grow" autocomplete="off" placeholder="${t("Colle ta clé ici")}" value="${esc(s.apiKey)}">
        <button class="icon-btn" id="eye" title="${t('Afficher/masquer')}">👁️</button>
      </div>
      <label class="field" for="model">${t("Modèle Gemini")}</label>
      <input id="model" type="text" list="models" value="${esc(s.model)}" autocomplete="off">
      <datalist id="models">${SUGGESTED_MODELS.map((m) => `<option value="${m}">`).join('')}</datalist>
      <p class="tiny muted">${t("Par défaut : le modèle « lite », le plus rapide. Si un modèle est surchargé ou à court de quota, l'appli bascule toute seule sur un autre.")}
        <a href="https://ai.google.dev/gemini-api/docs/models" target="_blank" rel="noopener">${t("Liste des modèles")}</a></p>
      ${toggle('verifyMode', t('🔍 Mode vérification'), s.verifyMode, `⚠️ <strong>${t("Double la consommation de quota")}</strong> ${t("(moitié moins de cours par jour). Un 2e appel à l’IA relit les fiches, quiz et corrections et corrige ou signale les erreurs. Désactivé par défaut.")}`)}
      <div class="row nowrap" style="margin-top:10px">
        <button class="btn grow" id="save">${t("💾 Enregistrer")}</button>
        <button class="btn ghost grow" id="test">${t("🧪 Tester")}</button>
      </div>
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">${t("📊 Quota Gemini aujourd’hui")}</h2>
      <p class="small muted">${t("Chaque modèle gratuit a son propre quota quotidien. Quand l’un est épuisé, l’appli passe tout seule au suivant.")}</p>
      <table class="data-table" style="width:100%">
        <thead><tr><th style="text-align:left">${t("Modèle")}</th><th>${t("Demandes")}</th><th>${t("État")}</th></tr></thead>
        <tbody>${models.map((m) => `<tr><td class="tiny" style="word-break:break-all">${esc(m)}</td><td class="center"><strong>${quota.counts[m] || 0}</strong></td>
          <td class="center tiny">${quota.exhausted[m] === 'quota' ? t('⛔ épuisé') : quota.exhausted[m] === 'absent' ? t('❌ indisponible') : t('✅ dispo')}</td></tr>`).join('')}</tbody>
      </table>
      <p class="small" style="margin:10px 0 0">${t("Total :")} <strong>${totalReq}</strong> ${t("demande")}${totalReq > 1 ? 's' : ''} ${t("aujourd’hui.\n        🔄 Prochaine recharge :")} <strong>${resetTimeText()}</strong> ${t("(heure de ton téléphone).")}</p>
      ${allOut ? `<p class="small" style="color:var(--bad);margin:6px 0 0">${t("Tous les modèles sont épuisés : l’IA revient à")} ${resetTimeText()}${t(". Tu peux réviser tes fiches et quiz en attendant !")}</p>` : ''}
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">${t("📲 Application")}</h2>
      <p class="small muted">${t("Installée, l'appli s'ouvre comme une vraie appli et marche sans connexion pour réviser.")}</p>
      <button class="btn block ${isInstalled() ? 'ghost' : ''}" id="install">${isInstalled() ? t('✅ Appli déjà installée') : t('📲 Installer l’appli')}</button>
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">${t("🎨 Ambiance")}</h2>
      <div class="seg" id="theme">
        <button data-t="dark" class="${s.theme !== 'light' ? 'active' : ''}">${t("🌙 Sombre")}</button>
        <button data-t="light" class="${s.theme === 'light' ? 'active' : ''}">${t("☀️ Clair")}</button>
      </div>
      <label class="field">${t("🎬 Scène de correction et pouvoirs")}</label>
      <div class="seg" id="council">
        <button data-v="complete" class="${s.council === 'complete' ? 'active' : ''}">${t("Complète")}</button>
        <button data-v="short" class="${s.council === 'short' ? 'active' : ''}">${t("Courte")}</button>
        <button data-v="off" class="${s.council === 'off' ? 'active' : ''}">${t("Désactivée")}</button>
      </div>
      <p class="tiny muted">${t("Le conseil des persos avant chaque note, et les auras / pouvoirs spéciaux. « Courte » (par défaut) : la note arrive en 1 à 2 s, pouvoirs plus brefs.")}</p>
      ${toggle('sounds', t('🔊 Sons'), s.sounds, t('Effets sonores style anime (générés par l’appli, rien à télécharger)'))}
      <div class="volume-row"><span class="small">🔈</span>
        <input id="volume" type="range" min="0" max="100" step="5" value="${Math.round((s.volume ?? 0.55) * 100)}" aria-label="${t("Volume")}">
        <span class="small">🔊</span><button class="btn ghost small" id="vol-test">${t("Tester")}</button></div>
      ${toggle('vibration', t('📳 Vibrations'), s.vibration, t('Légères vibrations sur les actions clés'))}
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">${t("💾 Sauvegarde")}</h2>
      ${mascot('tidiane', { text: t('Tes données sont seulement sur ce téléphone. Exporte une sauvegarde de temps en temps (Drive, WhatsApp, clé USB…).'), size: 70 })}
      <div class="row nowrap" style="margin-top:12px">
        <button class="btn grow" id="export">${t("⬇️ Exporter")}</button>
        <span class="btn ghost grow filepick">${t("⬆️ Importer")}<input id="import" type="file" accept="application/json,.json"></span>
      </div>
      <p class="tiny muted">${t("La clé API et les photos ne sont pas dans la sauvegarde.")} ${usage}</p>
    </div>

    ${isCreator() ? `
    <div class="tile" style="margin-bottom:12px;border-color:#FFD23F">
      <h2 style="margin-top:0">${t("👑 Mode Créateur")}</h2>
      <label class="field" for="cname">${t("Nom affiché")}</label>
      <div class="row nowrap"><input id="cname" type="text" class="grow" maxlength="24" value="${esc(creatorName())}">
        <button class="btn small" id="cname-ok">OK</button></div>
      <div class="row nowrap" style="margin-top:10px">
        <a class="btn small grow" href="#/createur">${t("Panneau créateur")}</a>
        <button class="btn ghost small grow" id="creator-off">${t("Désactiver")}</button>
      </div>
    </div>` : ''}

    <div class="tile" style="margin-bottom:12px;border-color:var(--bad)">
      <h2 style="margin-top:0">${t("🗑️ Zone dangereuse")}</h2>
      <button class="btn danger block" id="wipe">${t("Effacer toutes mes données")}</button>
    </div>
    ${isCreator() ? '' : `
    <details class="tiny dim" style="margin:0 4px 12px">
      <summary style="cursor:pointer">${t("🔒 Code créateur")}</summary>
      <div class="row nowrap" style="margin-top:8px">
        <input id="ccode" type="password" class="grow" autocomplete="off" placeholder="${t("Code")}">
        <button class="btn ghost small" id="ccode-ok">OK</button>
      </div>
    </details>`}
    <p class="tiny dim center">${t("Révision IA · marche hors ligne pour réviser")}</p>
  `;

  const $ = (q) => el.querySelector(q);
  $('#install').onclick = () => openInstall();

  // --- Mode Créateur ---
  const codeBtn = $('#ccode-ok');
  if (codeBtn) {
    const tryCode = async () => {
      const input = $('#ccode');
      const ok = await checkCode(input.value);
      input.value = ''; // on n'enregistre jamais ce qui a été tapé
      if (!ok) { toast(t('Code incorrect.'), 'error'); vibrate([30, 30, 30]); return; }
      const first = await enableCreator();
      if (first) await creatorWelcome();
      else toast(t('👑 Mode Créateur réactivé. Re-bonjour, sensei !'), 'ok');
      refresh();
    };
    codeBtn.onclick = tryCode;
    $('#ccode').onkeydown = (e) => { if (e.key === 'Enter') tryCode(); };
  }
  if ($('#creator-off')) {
    $('#creator-off').onclick = async () => {
      await disableCreator();
      toast(t('Mode Créateur désactivé.'));
      refresh();
    };
    $('#cname-ok').onclick = async () => {
      await setCreatorName($('#cname').value);
      toast(t('Nom enregistré ✅'), 'ok');
    };
  }
  $('#eye').onclick = () => { $('#key').type = $('#key').type === 'password' ? 'text' : 'password'; };

  async function saveKey() {
    await db.setSetting('apiKey', $('#key').value.trim());
    await db.setSetting('model', $('#model').value.trim() || db.DEFAULT_SETTINGS.model);
  }
  $('#save').onclick = async () => { await saveKey(); toast(t('Réglages enregistrés ✅'), 'ok'); vibrate(); };
  $('#test').onclick = async () => {
    await saveKey();
    const pg = progress(t('Test de la connexion'), 'tidiane');
    try {
      await testConnection();
      pg.done();
      toast(t('✅ Clé et modèle OK, l’IA est prête !'), 'ok');
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
  // Langue de l'appli : enregistrée, puis la page se recharge (choix de l'élève).
  el.querySelectorAll('#lang button').forEach((b) => { b.onclick = () => setLang(b.dataset.l); });
  el.querySelectorAll('#genLang button').forEach((b) => {
    b.onclick = async () => {
      await db.setSetting('genLang', b.dataset.v);
      el.querySelectorAll('#genLang button').forEach((x) => x.classList.toggle('active', x === b));
      vibrate();
    };
  });
  el.querySelectorAll('#council button').forEach((b) => {
    b.onclick = async () => {
      await db.setSetting('council', b.dataset.v);
      el.querySelectorAll('#council button').forEach((x) => x.classList.toggle('active', x === b));
      vibrate();
    };
  });
  $('#verifyMode').onchange = async (e) => {
    await db.setSetting('verifyMode', e.target.checked);
    toast(e.target.checked ? t('🔍 Mode vérification activé : il double la consommation de quota') : t('Mode vérification désactivé'), 'ok');
  };
  $('#volume').onchange = async (e) => {
    await db.setSetting('volume', Number(e.target.value) / 100);
    await loadFxPrefs();
    sound('good');
  };
  $('#vol-test').onclick = () => sound('level');
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
      toast(t('Sauvegarde téléchargée ✅'), 'ok');
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
      toast(`${t("✅ Sauvegarde importée (")}${n} ${t("éléments).")}`, 'ok');
      setTimeout(() => location.reload(), 800);
    } catch (err) {
      showError(err instanceof SyntaxError ? new Error(t('Fichier illisible (ce n’est pas un JSON valide).')) : err);
    }
  };

  $('#wipe').onclick = async () => {
    if (!(await confirmBox(t('Effacer TOUS tes cours, fiches, résultats et ta progression ? Exporte une sauvegarde avant !'), t('Tout effacer')))) return;
    for (const st of ['courses', 'images', 'cards', 'quizzes', 'results', 'reviews', 'exercises', 'exams', 'mangas', 'focus']) await db.clear(st);
    await db.setSetting('story', null);
    await db.setSetting('profile', null);
    location.hash = '#/bienvenue';
    location.reload();
  };
}
