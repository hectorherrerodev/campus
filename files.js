// ============================================================
// Archivos (PDF, imágenes...) guardados en IndexedDB del dispositivo.
// ============================================================
const DB = 'campus-files';
const STORE = 'blobs';
let dbp = null;
const memoria = new Map(); // respaldo si IndexedDB no está disponible

function db() {
  if (dbp) return dbp;
  dbp = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
  return dbp;
}

async function tx(mode, fn) {
  const d = await db();
  if (!d) return fn(null);
  return new Promise((resolve, reject) => {
    const t = d.transaction(STORE, mode);
    const s = t.objectStore(STORE);
    const r = fn(s);
    t.oncomplete = () => resolve(r?.result);
    t.onerror = () => reject(t.error);
  });
}

export async function putLocal(id, blob) {
  memoria.set(id, blob);
  try { await tx('readwrite', (s) => s && s.put(blob, id)); } catch { /* queda en memoria */ }
}
export async function getLocal(id) {
  if (memoria.has(id)) return memoria.get(id);
  try {
    const b = await tx('readonly', (s) => s && s.get(id));
    if (b) memoria.set(id, b);
    return b || null;
  } catch { return null; }
}
export async function delLocal(id) {
  memoria.delete(id);
  try { await tx('readwrite', (s) => s && s.delete(id)); } catch { /* nada */ }
}
