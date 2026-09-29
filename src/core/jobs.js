// =====================================================================
// jobs.js — Tâches IA en ARRIÈRE-PLAN (sans bloquer l'écran)
// ---------------------------------------------------------------------
// Exemple : après l'import d'un cours, le résumé arrive en streaming
// pendant que tu lis, puis les fiches et le quiz se préparent tout seuls.
// Chaque tâche est identifiée par (idCours, type) ; les écrans peuvent
// "écouter" une tâche pour se mettre à jour quand elle avance ou finit.
//
//   startJob(courseId, 'summary', async (update) => { … })
//   getJob(courseId, 'summary')  → { status, data, error, progress }
//   onJob(courseId, 'summary', (job) => { … })  → fonction pour arrêter d'écouter
// =====================================================================

const jobs = new Map();
const key = (courseId, kind) => `${courseId}:${kind}`;

/** État d'une tâche (ou undefined si jamais lancée). */
export function getJob(courseId, kind) {
  return jobs.get(key(courseId, kind));
}

/** Une tâche est-elle en cours ? */
export function isRunning(courseId, kind) {
  return getJob(courseId, kind)?.status === 'running';
}

function notify(job) {
  for (const cb of job.listeners) {
    try { cb(job); } catch (e) { console.error(e); }
  }
}

/**
 * Lance une tâche (ou renvoie celle déjà en cours).
 * `fn(update)` : update({ …infos }) prévient les écrans qui écoutent.
 */
export function startJob(courseId, kind, fn) {
  const existing = getJob(courseId, kind);
  if (existing?.status === 'running') return existing;
  const job = { courseId, kind, status: 'running', data: {}, error: null, listeners: existing?.listeners || new Set() };
  jobs.set(key(courseId, kind), job);
  const update = (data) => { Object.assign(job.data, data); notify(job); };
  job.promise = Promise.resolve()
    .then(() => fn(update))
    .then((result) => { job.status = 'done'; job.result = result; notify(job); return result; })
    .catch((e) => { job.status = 'error'; job.error = e; notify(job); console.error(e); });
  notify(job);
  return job;
}

/** Écoute une tâche. Renvoie une fonction pour arrêter d'écouter. */
export function onJob(courseId, kind, cb) {
  const k = key(courseId, kind);
  if (!jobs.has(k)) jobs.set(k, { courseId, kind, status: 'idle', data: {}, listeners: new Set() });
  const job = jobs.get(k);
  job.listeners.add(cb);
  return () => job.listeners.delete(cb);
}
