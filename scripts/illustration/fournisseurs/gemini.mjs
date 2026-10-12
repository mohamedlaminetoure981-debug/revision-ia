// =====================================================================
// fournisseurs/gemini.mjs — Images avec l'API Gemini (generateContent)
// ---------------------------------------------------------------------
// Modèle : GEMINI_IMAGE_MODEL dans .env.local, sinon la chaîne MODELES ci-dessous (le suivant
// est essayé si un modèle n'existe pas ou n'est pas ouvert à ta clé). Les noms changent souvent :
// `npm run modeles-images` liste ceux que TA clé peut utiliser.
// La clé part dans l'en-tête x-goog-api-key (jamais dans l'adresse, jamais affichée).
//
// Interface commune à tous les fournisseurs (voir index.mjs) :
//   generer({ texte, images: [{ mime, data: Buffer }], format: '16:9' })
//        → { image: Buffer, mime, modele, note }
//   traduire(texte) → texte anglais        listerModeles() → [{ nom, description }]
// Erreurs : ArretQuota (s'arrêter, reprendre plus tard), ErreurCase (cette case seulement),
//           Error (arrêt : clé refusée…).
// =====================================================================

import { ArretQuota, ErreurCase, prochainMinuitPacifique, attendre } from './erreurs.mjs';
import { masquer } from '../config.mjs';

export const MODELES = ['gemini-3.1-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-2.5-flash-image'];
const MODELES_TEXTE = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash-lite'];
const API = 'https://generativelanguage.googleapis.com/v1beta';

export function creer(env) {
  const key = env.GEMINI_API_KEY;
  const chaine = env.GEMINI_IMAGE_MODEL ? [env.GEMINI_IMAGE_MODEL] : [...MODELES];
  const chaineTexte = env.GEMINI_MODEL ? [env.GEMINI_MODEL] : [...MODELES_TEXTE];
  let sansFormat = false; // le modèle refuse imageConfig : on recadre nous-mêmes en 16:9

  async function appel(modele, body) {
    let res;
    try {
      res = await fetch(`${API}/models/${modele}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
      });
    } catch {
      return { reseau: true };
    }
    const txt = await res.text();
    let json = null;
    try { json = JSON.parse(txt); } catch { /* pas du JSON */ }
    return { status: res.status, json, txt: masquer(txt).slice(0, 600) };
  }

  /** Analyse une erreur HTTP : renvoie 'suivant' | 'reessayer' | lève l'erreur adaptée. */
  function erreur(r, modele) {
    const msg = r.json?.error?.message || r.txt;
    const details = r.json?.error?.details || [];
    if (r.status === 404) return 'suivant';
    if (r.status === 401 || r.status === 403) {
      if (/billing|free tier|not available|permission/i.test(msg) && r.status === 403) return 'suivant';
      throw new Error(`Clé refusée (${r.status}) : vérifie GEMINI_API_KEY dans .env.local. ${masquer(msg).slice(0, 200)}`);
    }
    if (r.status === 429 || (r.status === 400 && /quota|free.?tier|limit: ?0|billing/i.test(msg))) {
      const quotaIds = details.flatMap((d) => (d.violations || []).map((v) => v.quotaId || '')).join(' ');
      // « limit: 0 » : ce modèle n'a AUCUN quota (gratuit) pour ta clé → modèle suivant.
      if (/limit: ?0\b/i.test(msg) || /free.?tier.*not|billing/i.test(msg)) return 'suivant';
      if (/PerDay|per day|daily/i.test(`${quotaIds} ${msg}`)) return 'jour'; // quota du jour épuisé : modèle suivant
      const retry = details.find((d) => d.retryDelay)?.retryDelay; // ex. « 37s »
      const sec = retry ? parseFloat(retry) : 60;
      return { attendre: sec };
    }
    if (r.status === 400 && /image_?config|aspect_?ratio|imageSize|response_?modalities/i.test(msg) && !sansFormat) {
      sansFormat = true; return 'reessayer';
    }
    if (r.status >= 500) return { attendre: 0, serveur: true };
    throw new ErreurCase(`demande refusée par Gemini (${r.status}) : ${masquer(msg).slice(0, 300)}`);
  }

  /** Boucle commune : chaîne de modèles, 503 réessayés 3 fois, quota → ArretQuota. */
  async function executer(modeles, construire, lire) {
    let i = 0; let serveur = 0; let pauses = 0; let jour = false;
    while (i < modeles.length) {
      const modele = modeles[i];
      const r = await appel(modele, construire());
      if (r.reseau) {
        serveur++;
        if (serveur > 3) throw new ArretQuota('pas de connexion internet', new Date(Date.now() + 10 * 60000));
        console.log(`   📡 Pas de connexion, nouvel essai dans ${10 * serveur} s…`); await attendre(10000 * serveur); continue;
      }
      if (r.status === 200) {
        const out = lire(r.json, modele);
        if (out) return out;
        throw new ErreurCase(raisonVide(r.json));
      }
      const d = erreur(r, modele);
      if (d === 'suivant') { console.log(`   ⏭️ ${modele} indisponible pour ta clé → modèle suivant`); i++; continue; }
      if (d === 'jour') { console.log(`   ⏭️ quota du jour épuisé pour ${modele} → modèle suivant`); jour = true; i++; continue; }
      if (d === 'reessayer') continue;
      if (d.serveur) {
        serveur++;
        if (serveur > 3) throw new ArretQuota(`Gemini est surchargé (erreur ${r.status})`, new Date(Date.now() + 15 * 60000));
        const s = [15, 30, 60][serveur - 1];
        console.log(`   🛠️ Gemini surchargé (${r.status}), nouvel essai ${serveur}/3 dans ${s} s…`); await attendre(s * 1000); continue;
      }
      if (d.attendre !== undefined) {
        if (d.attendre > 90 || pauses >= 2) throw new ArretQuota(`limite de demandes atteinte pour ${modele}`, new Date(Date.now() + Math.max(d.attendre, 60) * 1000));
        pauses++;
        console.log(`   ⏳ Limite par minute atteinte, pause de ${Math.ceil(d.attendre)} s…`); await attendre(Math.ceil(d.attendre) * 1000); continue;
      }
    }
    if (jour) throw new ArretQuota('quota du jour épuisé (tous les modèles essayés)', prochainMinuitPacifique());
    throw new ArretQuota(`aucun modèle de la liste n'est ouvert à ta clé (${modeles.join(', ')}). Lance « npm run modeles-images » pour voir les modèles disponibles, puis mets le bon nom dans .env.local (GEMINI_IMAGE_MODEL=…). Les modèles d'images peuvent exiger la facturation activée`, null, 'modeles-refuses');
  }

  return {
    nom: 'gemini',
    modeles: chaine,
    /** Requête telle qu'elle partira (pour le mode --essai : images remplacées par leur taille). */
    requete({ texte, images, format = '16:9' }, apercu = false) {
      const parts = [
        ...images.map((im) => ({ inline_data: { mime_type: im.mime, data: apercu ? `<image ${im.mime}, ${Math.round(im.data.length / 1024)} Ko : ${im.nom}>` : im.data.toString('base64') } })),
        { text: texte },
      ];
      const generationConfig = { responseModalities: ['TEXT', 'IMAGE'] };
      if (!sansFormat) generationConfig.imageConfig = { aspectRatio: format };
      return { contents: [{ role: 'user', parts }], generationConfig };
    },
    async generer(demande) {
      return executer(chaine, () => this.requete(demande), (json, modele) => {
        const parts = json?.candidates?.[0]?.content?.parts || [];
        const img = parts.find((p) => p.inlineData?.data || p.inline_data?.data);
        if (!img) return null;
        const d = img.inlineData || img.inline_data;
        const note = parts.map((p) => p.text || '').join(' ').trim();
        return { image: Buffer.from(d.data, 'base64'), mime: d.mimeType || d.mime_type || 'image/png', modele, note, recadrer: sansFormat };
      });
    },
    async traduire(texte) {
      return executer(chaineTexte, () => ({
        contents: [{ role: 'user', parts: [{ text: `Translate this comic panel description from French to English. Keep every visual detail, names (Kaï, Mory, Nia…), left/right positions and colors. Answer with the translation only.\n\n${texte}` }] }],
        generationConfig: { temperature: 0.2 },
      }), (json) => (json?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim() || null);
    },
    async listerModeles() {
      const out = [];
      let page = '';
      for (let k = 0; k < 10; k++) {
        const res = await fetch(`${API}/models?pageSize=200${page ? `&pageToken=${page}` : ''}`, { headers: { 'x-goog-api-key': key } });
        if (!res.ok) throw new Error(`Liste des modèles refusée (${res.status}) : ${masquer(await res.text()).slice(0, 200)}`);
        const j = await res.json();
        for (const m of j.models || []) {
          if (/image|imagen|banana/i.test(m.name) && (m.supportedGenerationMethods || []).includes('generateContent')) out.push({ nom: m.name.replace(/^models\//, ''), description: m.displayName || '' });
        }
        page = j.nextPageToken; if (!page) break;
      }
      return out;
    },
  };
}

function raisonVide(json) {
  const c = json?.candidates?.[0];
  const why = c?.finishReason || json?.promptFeedback?.blockReason || 'inconnue';
  const txt = (c?.content?.parts || []).map((p) => p.text || '').join(' ').trim();
  return `Gemini n'a pas renvoyé d'image (raison : ${why})${txt ? ` — message : « ${txt.slice(0, 200)} »` : ''}. Reformule la consigne ou relance.`;
}
