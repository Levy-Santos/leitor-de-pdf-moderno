/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Book, 
  Bookmark, 
  Highlight, 
  ParsedBookContent, 
  ReadingSettings, 
  DEFAULT_SETTINGS 
} from './types/reader';
import { 
  getAllBooks, 
  getBook, 
  saveBook, 
  updateReadingProgress, 
  deleteBook as dbDeleteBook,
  saveParsedContent, 
  getParsedContent, 
  savePdfBlob, 
  getPdfBlob, 
  getBookmarks, 
  saveBookmark, 
  deleteBookmark as dbDeleteBookmark,
  getHighlights, 
  saveHighlight, 
  deleteHighlight as dbDeleteHighlight,
  loadSettings, 
  saveSettings 
} from './services/storage';
import { parsePdfFile, ParseProgress } from './services/pdfExtractor';
import { SAMPLE_BOOKS } from './data/sampleBooks';
import { ttsService, TtsState } from './services/tts';
import { LibraryView } from './components/LibraryView';
import { HeaderNav } from './components/HeaderNav';
import { BottomToolbar } from './components/BottomToolbar';
import { ReflowReader } from './components/ReflowReader';
import { OriginalPdfViewer } from './components/OriginalPdfViewer';
import { AppearanceModal } from './components/AppearanceModal';
import { TocDrawer } from './components/TocDrawer';
import { SearchBar } from './components/SearchBar';
import { TtsControlsBar } from './components/TtsControlsBar';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentContent, setCurrentContent] = useState<ParsedBookContent | null>(null);
  const [currentPdfBlob, setCurrentPdfBlob] = useState<ArrayBuffer | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [settings, setSettings] = useState<ReadingSettings>(loadSettings);

  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState<boolean>(false);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isOriginalPdfView, setIsOriginalPdfView] = useState<boolean>(false);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseProgress, setParseProgress] = useState<ParseProgress | null>(null);

  const [ttsState, setTtsState] = useState<TtsState>({
    isPlaying: false,
    isPaused: false,
    currentBlockId: null,
    rate: 1.0,
    availableVoices: [],
    selectedVoice: null,
  });

  // Track debounced progress saving
  const progressSaveTimeout = useRef<number | null>(null);

  // Load books from IndexedDB, seeding sample books if empty
  const loadBooksList = useCallback(async () => {
    try {
      let storedBooks = await getAllBooks();
      if (storedBooks.length === 0) {
        // Seed sample books for instant out-of-the-box delight
        for (const sample of SAMPLE_BOOKS) {
          await saveBook(sample.book);
          await saveParsedContent(sample.content);
        }
        storedBooks = await getAllBooks();
      }
      setBooks(storedBooks);
    } catch (err) {
      console.error('Error loading books:', err);
    }
  }, []);

  useEffect(() => {
    loadBooksList();
  }, [loadBooksList]);

  // Subscribe to TTS changes
  useEffect(() => {
    const unsubscribe = ttsService.subscribe((state) => {
      setTtsState(state);
    });
    return () => unsubscribe();
  }, []);

  // Save settings whenever they change
  const handleUpdateSettings = (updater: (prev: ReadingSettings) => ReadingSettings) => {
    setSettings((prev) => {
      const updated = updater(prev);
      saveSettings(updated);
      return updated;
    });
  };

  // Open a book
  const handleOpenBook = async (book: Book) => {
    try {
      ttsService.stop();
      setCurrentBook(book);
      setCurrentPage(book.currentPage || 1);
      setIsOriginalPdfView(false);

      // Load parsed content
      const content = await getParsedContent(book.id);
      if (content) {
        setCurrentContent(content);
      } else {
        // Check if it's one of the sample books
        const sample = SAMPLE_BOOKS.find((s) => s.book.id === book.id);
        if (sample) {
          setCurrentContent(sample.content);
          await saveParsedContent(sample.content);
        }
      }

      // Check if original PDF blob is saved
      const blob = await getPdfBlob(book.id);
      setCurrentPdfBlob(blob);

      // Load bookmarks & highlights
      const [bm, hl] = await Promise.all([
        getBookmarks(book.id),
        getHighlights(book.id),
      ]);
      setBookmarks(bm);
      setHighlights(hl);

      // Update last read timestamp in storage
      book.lastReadTimestamp = Date.now();
      await saveBook(book);
      loadBooksList();
    } catch (err) {
      console.error('Error opening book:', err);
    }
  };

  // Close book and return to library
  const handleBackToLibrary = () => {
    ttsService.stop();
    // Flush current progress immediately
    if (currentBook) {
      updateReadingProgress(
        currentBook.id,
        currentPage,
        currentBook.scrollProgress || 0
      );
    }
    setCurrentBook(null);
    setCurrentContent(null);
    setCurrentPdfBlob(null);
    loadBooksList();
  };

  // Handle PDF file upload
  const handleUploadFile = async (file: File) => {
    setIsParsing(true);
    setParseProgress({
      currentPage: 0,
      totalPages: 0,
      percent: 0,
      stage: 'Lendo arquivo PDF...',
    });

    try {
      const rawBuffer = await file.arrayBuffer();
      // Keep a distinct copy for storage before parsing touches anything
      const storageBuffer = rawBuffer.slice(0);
      const parseBuffer = rawBuffer.slice(0);

      const { book, content } = await parsePdfFile(
        parseBuffer,
        file.name,
        (p) => setParseProgress(p)
      );

      // Save to IndexedDB
      await saveBook(book);
      await saveParsedContent(content);
      await savePdfBlob(book.id, storageBuffer);

      // Reload list and open book directly
      await loadBooksList();
      setIsParsing(false);
      setParseProgress(null);
      handleOpenBook(book);
    } catch (err) {
      console.error('Error parsing uploaded PDF:', err);
      alert('Não foi possível ler este arquivo PDF. Verifique se o arquivo não está corrompido ou protegido por senha.');
      setIsParsing(false);
      setParseProgress(null);
    }
  };

  // Load sample book
  const handleLoadSampleBook = (sampleId: string) => {
    const sample = SAMPLE_BOOKS.find((s) => s.book.id === sampleId);
    if (sample) {
      handleOpenBook(sample.book);
    }
  };

  // Delete book
  const handleDeleteBook = async (bookId: string) => {
    if (confirm('Tem certeza de que deseja remover este livro da sua estante?')) {
      await dbDeleteBook(bookId);
      loadBooksList();
    }
  };

  // Reset progress
  const handleResetProgress = async (bookId: string) => {
    await updateReadingProgress(bookId, 1, 0);
    loadBooksList();
  };

  // Debounced progress saver
  const handleProgressUpdate = useCallback(
    (page: number, percent: number) => {
      if (!currentBook) return;

      setCurrentPage(page);

      if (progressSaveTimeout.current) {
        window.clearTimeout(progressSaveTimeout.current);
      }

      progressSaveTimeout.current = window.setTimeout(() => {
        updateReadingProgress(currentBook.id, page, percent);
      }, 400);
    },
    [currentBook]
  );

  // Direct page change
  const handlePageChange = (newPage: number) => {
    if (!currentBook) return;
    const clamped = Math.max(1, Math.min(currentBook.totalPages, newPage));
    setCurrentPage(clamped);

    const percent = currentBook.totalPages > 0 ? (clamped / currentBook.totalPages) * 100 : 0;
    updateReadingProgress(currentBook.id, clamped, percent);
  };

  // Bookmarking
  const isCurrentPageBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);

  const handleToggleBookmark = async () => {
    if (!currentBook) return;

    const existing = bookmarks.find((b) => b.pageNumber === currentPage);
    if (existing) {
      await dbDeleteBookmark(existing.id);
      setBookmarks((bms) => bms.filter((b) => b.id !== existing.id));
    } else {
      // Find a snippet on this page
      const pageData = currentContent?.pages.find((p) => p.pageNumber === currentPage);
      const snippet = pageData?.blocks[0]?.text.slice(0, 120) || `Página ${currentPage}`;

      const newBm: Bookmark = {
        id: 'bm_' + Date.now(),
        bookId: currentBook.id,
        pageNumber: currentPage,
        snippet,
        createdAt: Date.now(),
      };

      await saveBookmark(newBm);
      setBookmarks((bms) => [...bms, newBm]);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    await dbDeleteBookmark(id);
    setBookmarks((bms) => bms.filter((b) => b.id !== id));
  };

  // Highlights
  const handleAddHighlight = async (hlData: Omit<Highlight, 'id' | 'createdAt'>) => {
    const newHl: Highlight = {
      ...hlData,
      id: 'hl_' + Date.now(),
      createdAt: Date.now(),
    };
    await saveHighlight(newHl);
    setHighlights((hls) => [...hls, newHl]);
  };

  const handleDeleteHighlight = async (id: string) => {
    await dbDeleteHighlight(id);
    setHighlights((hls) => hls.filter((h) => h.id !== id));
  };

  // TTS Narrate toggle
  const handleToggleTts = () => {
    if (ttsState.isPlaying) {
      ttsService.stop();
      return;
    }

    if (!currentContent) return;

    // Build queue starting from current page
    const queue: { id: string; text: string }[] = [];
    const relevantPages = currentContent.pages.filter((p) => p.pageNumber >= currentPage);

    for (const p of relevantPages) {
      for (const b of p.blocks) {
        if (b.text.trim()) {
          queue.push({ id: b.id, text: b.text });
        }
      }
    }

    if (queue.length > 0) {
      ttsService.playQueue(queue, 0);
    }
  };

  // Search result jump
  const handleSelectSearchResult = (pageNumber: number) => {
    handlePageChange(pageNumber);
  };

  return (
    <div className="min-h-screen">
      {/* If no book opened: Library view */}
      {!currentBook ? (
        <LibraryView
          books={books}
          onOpenBook={handleOpenBook}
          onUploadFile={handleUploadFile}
          onDeleteBook={handleDeleteBook}
          onResetProgress={handleResetProgress}
          onLoadSampleBook={handleLoadSampleBook}
          isParsing={isParsing}
          parseProgress={parseProgress}
          settings={settings}
          onOpenSettings={() => setIsAppearanceOpen(true)}
        />
      ) : (
        /* Reading View */
        <div className="relative min-h-screen">
          {/* Header Controls */}
          <HeaderNav
            book={currentBook}
            settings={settings}
            visible={controlsVisible}
            onBackToLibrary={handleBackToLibrary}
            onOpenToc={() => setIsTocOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onToggleBookmark={handleToggleBookmark}
            isCurrentPageBookmarked={isCurrentPageBookmarked}
            isTtsPlaying={ttsState.isPlaying}
            onToggleTts={handleToggleTts}
            isOriginalPdfView={isOriginalPdfView}
            onToggleOriginalPdf={() => setIsOriginalPdfView((v) => !v)}
            hasOriginalPdf={Boolean(currentPdfBlob)}
          />

          {/* Core Reader: either Reflow Mode or Original PDF Canvas View */}
          {isOriginalPdfView && currentPdfBlob ? (
            <OriginalPdfViewer
              pdfData={currentPdfBlob}
              currentPage={currentPage}
              totalPages={currentBook.totalPages}
              settings={settings}
              onPageChange={handlePageChange}
            />
          ) : currentContent ? (
            <ReflowReader
              book={currentBook}
              content={currentContent}
              settings={settings}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onProgressUpdate={handleProgressUpdate}
              onToggleControls={() => setControlsVisible((v) => !v)}
              onAddHighlight={handleAddHighlight}
              onAddBookmark={(page, snippet) => {
                const bm: Bookmark = {
                  id: 'bm_' + Date.now(),
                  bookId: currentBook.id,
                  pageNumber: page,
                  snippet,
                  createdAt: Date.now(),
                };
                saveBookmark(bm);
                setBookmarks((bms) => [...bms, bm]);
              }}
              bookmarks={bookmarks}
              highlights={highlights}
              ttsState={ttsState}
            />
          ) : (
            <div className="min-h-screen flex items-center justify-center">
              <p className="text-sm opacity-60">Carregando conteúdo do livro...</p>
            </div>
          )}

          {/* Floating TTS Controls */}
          <TtsControlsBar
            ttsState={ttsState}
            settings={settings}
            onClose={() => ttsService.stop()}
          />

          {/* Bottom Toolbar */}
          <BottomToolbar
            book={currentBook}
            settings={settings}
            visible={controlsVisible}
            currentPage={currentPage}
            totalPages={currentBook.totalPages}
            onPageChange={handlePageChange}
            onUpdateSettings={handleUpdateSettings}
            onOpenAppearance={() => setIsAppearanceOpen(true)}
          />

          {/* Slide-over Table of Contents & Bookmarks Drawer */}
          {currentContent && (
            <TocDrawer
              isOpen={isTocOpen}
              onClose={() => setIsTocOpen(false)}
              toc={currentContent.toc}
              bookmarks={bookmarks}
              highlights={highlights}
              currentPage={currentPage}
              totalPages={currentBook.totalPages}
              settings={settings}
              onSelectPage={handlePageChange}
              onDeleteBookmark={handleDeleteBookmark}
              onDeleteHighlight={handleDeleteHighlight}
            />
          )}

          {/* In-Book Search Modal */}
          {currentContent && (
            <SearchBar
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              content={currentContent}
              settings={settings}
              onSelectResult={handleSelectSearchResult}
            />
          )}
        </div>
      )}

      {/* Typography & Appearance Customization Modal / Bottom Sheet */}
      <AppearanceModal
        isOpen={isAppearanceOpen}
        onClose={() => setIsAppearanceOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Connectivity Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}
