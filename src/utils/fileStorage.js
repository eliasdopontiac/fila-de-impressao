/**
 * Rock-Solid File Storage & Download Engine for PrintStream 3D
 * Supports direct Base64 DataURL embedding + IndexedDB + Memory Cache
 */

const DB_NAMES = ['PrintStreamFilesDB_v2', 'PrintStreamFilesDB'];
const STORE_NAME = 'filesStore';
const memoryFileCache = new Map();

// Helper to convert File/Blob to Base64 DataURL
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Helper to convert Base64 DataURL back to Blob
export function dataUrlToBlob(dataUrl) {
  if (!dataUrl) return null;
  try {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Error parsing DataURL to Blob:', e);
    return null;
  }
}

function openDB(dbName = 'PrintStreamFilesDB_v2') {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(dbName, 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Saves a File/Blob to memory cache and all IndexedDB stores
 */
export async function saveFileToStorage(fileId, fileObject) {
  if (!fileObject || !fileId) return null;

  // 1. Save in RAM Memory Cache
  memoryFileCache.set(fileId, fileObject);

  // 2. Save in IndexedDB
  for (const dbName of DB_NAMES) {
    try {
      const db = await openDB(dbName);
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(fileObject, fileId);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      // Ignore
    }
  }

  // 3. Generate DataURL for embedded persistence
  try {
    const dataUrl = await fileToDataUrl(fileObject);
    return dataUrl;
  } catch (e) {
    return null;
  }
}

/**
 * Retrieves a File or Blob from job.fileDataUrl, RAM cache, or IndexedDB
 */
export async function getFileFromStorage(fileId, jobDataUrl = null) {
  // 1. If job has embedded DataURL, convert directly to Blob (Instant & 100% reliable)
  if (jobDataUrl) {
    const blob = dataUrlToBlob(jobDataUrl);
    if (blob) {
      memoryFileCache.set(fileId, blob);
      return blob;
    }
  }

  if (!fileId) return null;

  // 2. Check RAM memory cache
  if (memoryFileCache.has(fileId)) {
    return memoryFileCache.get(fileId);
  }

  // 3. Check all IndexedDB stores
  for (const dbName of DB_NAMES) {
    try {
      const db = await openDB(dbName);
      const result = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(fileId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });

      if (result) {
        memoryFileCache.set(fileId, result);
        return result;
      }
    } catch (e) {
      // Ignore
    }
  }

  return null;
}

/**
 * Builds placeholder GCODE
 */
export function buildPlaceholderBlob(fileName, sampleGcode) {
  if (sampleGcode && sampleGcode.trim().length > 10) {
    return new Blob([sampleGcode], { type: 'text/plain;charset=utf-8' });
  }

  const content =
    `; ============================================\n` +
    `; PrintStream 3D - Arquivo: ${fileName}\n` +
    `; Gerado em: ${new Date().toLocaleString('pt-BR')}\n` +
    `; ============================================\n` +
    `M104 S215\nM140 S60\nG28\nG92 E0\nG1 Z0.2 F3000\n` +
    `; --- Fim do Arquivo ---\n`;

  return new Blob([content], { type: 'text/plain;charset=utf-8' });
}

/**
 * Direct file download trigger via Blob
 */
export function triggerBlobDownload(blob, fileName) {
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName || 'arquivo_impressao.stl';
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    try {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      // Ignore
    }
  }, 1000);
}

/**
 * Download job file: gets real file or fallback and downloads
 */
export async function downloadJobFile(job) {
  if (!job) return;

  let fileBlob = await getFileFromStorage(job.id, job.fileDataUrl);

  if (!fileBlob) {
    fileBlob = buildPlaceholderBlob(job.fileName, job.sampleGcode);
  }

  triggerBlobDownload(fileBlob, job.fileName);
}

/**
 * Format bytes to readable size
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
