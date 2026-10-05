// =====================================================================
// share.js — Partager une image (planche manga, statut WhatsApp, carte…)
// ---------------------------------------------------------------------
// 1. Si le téléphone sait partager des fichiers (Web Share API) :
//    ouvre le menu "Partager" (WhatsApp, etc.).
// 2. Sinon : télécharge l'image (l'utilisateur la partage ensuite lui-même).
// =====================================================================

import { toast } from './ui.js';
import { t } from '../i18n/index.js';

/**
 * @param {Blob}   blob      image PNG
 * @param {string} filename  ex. 'manga-pythagore.png'
 * @param {string} [text]    message qui accompagne l'image
 * @returns {Promise<'shared'|'downloaded'|'cancelled'>}
 */
export async function shareImage(blob, filename, text = '') {
  const file = new File([blob], filename, { type: blob.type || 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';
      // Autre erreur : on passe au téléchargement.
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast(t('📥 Image enregistrée dans tes téléchargements.'), 'ok');
  return 'downloaded';
}

/** Nom de fichier propre à partir d'un titre. */
export function fileName(prefix, title, ext = 'png') {
  const slug = String(title || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `${prefix}${slug ? '-' + slug : ''}.${ext}`;
}
