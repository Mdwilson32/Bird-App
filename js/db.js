// IndexedDB storage for harvest log entries. Photos are stored as Blobs on the entry.

const DB_NAME = 'bird-logbook';
const DB_VERSION = 1;
const STORE = 'entries';

let dbPromise;

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const store = req.result.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('speciesId', 'speciesId');
        store.createIndex('date', 'date');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function run(mode, fn) {
  return open().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const result = fn(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(result && 'result' in result ? result.result : result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }),
  );
}

export const getAllEntries = () => run('readonly', (store) => store.getAll());
export const getEntry = (id) => run('readonly', (store) => store.get(id));
export const putEntry = (entry) => run('readwrite', (store) => store.put(entry));
export const deleteEntry = (id) => run('readwrite', (store) => store.delete(id));
export const clearEntries = () => run('readwrite', (store) => store.clear());

export const putEntries = (entries) =>
  run('readwrite', (store) => {
    for (const e of entries) store.put(e);
  });

export function newId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
