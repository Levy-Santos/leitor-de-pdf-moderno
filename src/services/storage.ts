import { Book, Bookmark, Highlight, ParsedBookContent, ReadingSettings, DEFAULT_SETTINGS } from '../types/reader';

const DB_NAME = 'reflow_pdf_reader_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('books')) {
        const bookStore = db.createObjectStore('books', { keyPath: 'id' });
        bookStore.createIndex('lastReadTimestamp', 'lastReadTimestamp');
      }

      if (!db.objectStoreNames.contains('parsedContent')) {
        db.createObjectStore('parsedContent', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('pdfBlobs')) {
        db.createObjectStore('pdfBlobs', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('bookmarks')) {
        const bmStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
        bmStore.createIndex('bookId', 'bookId');
      }

      if (!db.objectStoreNames.contains('highlights')) {
        const hlStore = db.createObjectStore('highlights', { keyPath: 'id' });
        hlStore.createIndex('bookId', 'bookId');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

// ---------------- BOOK METADATA ----------------

export async function getAllBooks(): Promise<Book[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('books', 'readonly');
      const store = tx.objectStore('books');
      const request = store.getAll();
      request.onsuccess = () => {
        const books = (request.result as Book[]) || [];
        books.sort((a, b) => b.lastReadTimestamp - a.lastReadTimestamp);
        resolve(books);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error getting books:', err);
    return [];
  }
}

export async function getBook(id: string): Promise<Book | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('books', 'readonly');
      const store = tx.objectStore('books');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error getting book:', err);
    return null;
  }
}

export async function saveBook(book: Book): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('books', 'readwrite');
    const store = tx.objectStore('books');
    const request = store.put(book);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function updateReadingProgress(
  id: string,
  currentPage: number,
  scrollProgress: number
): Promise<void> {
  const book = await getBook(id);
  if (!book) return;

  book.currentPage = currentPage;
  book.scrollProgress = Math.max(0, Math.min(100, Math.round(scrollProgress)));
  book.lastReadTimestamp = Date.now();
  await saveBook(book);
}

export async function deleteBook(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['books', 'parsedContent', 'pdfBlobs', 'bookmarks', 'highlights'], 'readwrite');
    tx.objectStore('books').delete(id);
    tx.objectStore('parsedContent').delete(id);
    tx.objectStore('pdfBlobs').delete(id);

    // Clean bookmarks & highlights
    const bmStore = tx.objectStore('bookmarks');
    const bmIndex = bmStore.index('bookId');
    const bmReq = bmIndex.getAllKeys(id);
    bmReq.onsuccess = () => {
      for (const key of bmReq.result) {
        bmStore.delete(key);
      }
    };

    const hlStore = tx.objectStore('highlights');
    const hlIndex = hlStore.index('bookId');
    const hlReq = hlIndex.getAllKeys(id);
    hlReq.onsuccess = () => {
      for (const key of hlReq.result) {
        hlStore.delete(key);
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------------- PARSED CONTENT ----------------

export async function saveParsedContent(content: ParsedBookContent): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('parsedContent', 'readwrite');
    const store = tx.objectStore('parsedContent');
    const request = store.put(content);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getParsedContent(id: string): Promise<ParsedBookContent | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('parsedContent', 'readonly');
      const store = tx.objectStore('parsedContent');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error getting parsed content:', err);
    return null;
  }
}

// ---------------- RAW PDF BLOBS ----------------

export async function savePdfBlob(id: string, data: ArrayBuffer | Blob): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    try {
      let dataToStore = data;
      // If it's an ArrayBuffer, ensure it's not detached and clone it safely
      if (data instanceof ArrayBuffer) {
        if (data.byteLength === 0) {
          console.warn('ArrayBuffer is empty or detached, skipping blob save');
          resolve();
          return;
        }
        dataToStore = data.slice(0);
      }
      const tx = db.transaction('pdfBlobs', 'readwrite');
      const store = tx.objectStore('pdfBlobs');
      const request = store.put({ id, data: dataToStore });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (e) {
      console.warn('Could not store raw pdf in IndexedDB:', e);
      resolve(); // Do not block reading if browser storage rejects raw blob
    }
  });
}

export async function getPdfBlob(id: string): Promise<ArrayBuffer | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pdfBlobs', 'readonly');
      const store = tx.objectStore('pdfBlobs');
      const request = store.get(id);
      request.onsuccess = async () => {
        const item = request.result?.data;
        if (!item) {
          resolve(null);
          return;
        }
        if (item instanceof ArrayBuffer) {
          resolve(item.byteLength > 0 ? item.slice(0) : null);
        } else if (item instanceof Blob) {
          try {
            const buf = await item.arrayBuffer();
            resolve(buf);
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error getting pdf blob:', err);
    return null;
  }
}

// ---------------- BOOKMARKS & HIGHLIGHTS ----------------

export async function getBookmarks(bookId: string): Promise<Bookmark[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('bookmarks', 'readonly');
      const store = tx.objectStore('bookmarks');
      const index = store.index('bookId');
      const request = index.getAll(bookId);
      request.onsuccess = () => {
        const items = (request.result as Bookmark[]) || [];
        items.sort((a, b) => a.pageNumber - b.pageNumber);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function saveBookmark(bookmark: Bookmark): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('bookmarks', 'readwrite');
    const store = tx.objectStore('bookmarks');
    const request = store.put(bookmark);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteBookmark(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('bookmarks', 'readwrite');
    const store = tx.objectStore('bookmarks');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getHighlights(bookId: string): Promise<Highlight[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('highlights', 'readonly');
      const store = tx.objectStore('highlights');
      const index = store.index('bookId');
      const request = index.getAll(bookId);
      request.onsuccess = () => {
        const items = (request.result as Highlight[]) || [];
        items.sort((a, b) => a.pageNumber - b.pageNumber);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function saveHighlight(highlight: Highlight): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('highlights', 'readwrite');
    const store = tx.objectStore('highlights');
    const request = store.put(highlight);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteHighlight(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('highlights', 'readwrite');
    const store = tx.objectStore('highlights');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ---------------- SETTINGS ----------------

const SETTINGS_KEY = 'reflow_reader_settings_v1';

export function loadSettings(): ReadingSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: ReadingSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}
