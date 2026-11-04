import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Bookmark as BookmarkIcon, 
  Volume2, 
  Highlighter, 
  Copy, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { 
  Book, 
  Bookmark, 
  Highlight, 
  ParagraphBlock, 
  ParsedBookContent, 
  ParsedPage, 
  ReadingSettings, 
  THEMES, 
  FONT_CONFIGS 
} from '../types/reader';
import { renderBionicText } from '../utils/bionic';
import { ttsService, TtsState } from '../services/tts';

interface ReflowReaderProps {
  book: Book;
  content: ParsedBookContent;
  settings: ReadingSettings;
  currentPage: number;
  onPageChange: (page: number) => void;
  onProgressUpdate: (page: number, percent: number) => void;
  onToggleControls: () => void;
  onAddHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  onAddBookmark: (page: number, snippet: string) => void;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  ttsState: TtsState;
}

export const ReflowReader: React.FC<ReflowReaderProps> = ({
  book,
  content,
  settings,
  currentPage,
  onPageChange,
  onProgressUpdate,
  onToggleControls,
  onAddHighlight,
  onAddBookmark,
  bookmarks,
  highlights,
  ttsState,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Map<number, HTMLElement>>(new Map());
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());

  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedPageNum, setSelectedPageNum] = useState<number>(currentPage);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const currentTheme = THEMES[settings.theme];
  const fontConfig = FONT_CONFIGS[settings.fontFamily];

  // Width container class
  const maxWidthClass = {
    narrow: 'max-w-md',
    medium: 'max-w-2xl',
    wide: 'max-w-3xl',
    full: 'max-w-4xl',
  }[settings.columnWidth];

  // Scroll to current page on mount or when page is externally changed in continuous mode
  const isContinuous = settings.readingMode === 'continuous';

  useEffect(() => {
    if (isContinuous && currentPage > 1) {
      const el = pageRefs.current.get(currentPage);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentPage, isContinuous]);

  // Handle continuous scroll to update current page and percentage
  const handleScroll = useCallback(() => {
    if (!isContinuous || !containerRef.current) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    // Detect which page element is in the upper third of the viewport
    const viewportThreshold = window.innerHeight * 0.35;
    let visiblePage = 1;

    for (const [pageNum, el] of pageRefs.current.entries()) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= viewportThreshold) {
        visiblePage = pageNum;
      }
    }

    onProgressUpdate(visiblePage, scrollPercent);
  }, [isContinuous, onProgressUpdate]);

  useEffect(() => {
    if (!isContinuous) return;

    let timeoutId: number;
    const debouncedScroll = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', debouncedScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
      window.clearTimeout(timeoutId);
    };
  }, [isContinuous, handleScroll]);

  // Scroll to active TTS paragraph when narrating
  useEffect(() => {
    if (ttsState.currentBlockId) {
      const el = blockRefs.current.get(ttsState.currentBlockId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [ttsState.currentBlockId]);

  // Text selection handler
  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelectedText('');
      setSelectionPosition(null);
      return;
    }

    const text = sel.toString().trim();
    if (text.length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setSelectionPosition({
        x: Math.max(16, Math.min(window.innerWidth - 220, rect.left + rect.width / 2 - 100)),
        y: Math.max(70, rect.top - 48),
      });

      // Find which page this was in
      let node: Node | null = range.startContainer;
      while (node && node !== document.body) {
        if (node instanceof HTMLElement && node.dataset.pagenum) {
          setSelectedPageNum(Number(node.dataset.pagenum));
          break;
        }
        node = node.parentNode;
      }
    }
  };

  const handleCopy = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      setCopiedSnippet(true);
      setTimeout(() => {
        setCopiedSnippet(false);
        setSelectedText('');
        setSelectionPosition(null);
      }, 1200);
    }
  };

  const handleHighlight = (color: Highlight['color']) => {
    if (!selectedText) return;
    onAddHighlight({
      bookId: book.id,
      pageNumber: selectedPageNum,
      text: selectedText,
      color,
    });
    setSelectedText('');
    setSelectionPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleSpeakSelection = () => {
    if (!selectedText) return;
    ttsService.playQueue([{ id: 'selected_snippet', text: selectedText }], 0);
    setSelectedText('');
    setSelectionPosition(null);
  };

  // Click on background to toggle navigation bars
  const handleContainerClick = (e: React.MouseEvent) => {
    // If clicking on a button, link or selection, don't toggle
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || window.getSelection()?.toString().trim()) {
      return;
    }

    // In paginated mode, check click position for page flip
    if (!isContinuous) {
      const clickX = e.clientX;
      const width = window.innerWidth;
      if (clickX < width * 0.25) {
        // Tap left edge: previous page
        if (currentPage > 1) {
          onPageChange(currentPage - 1);
        }
        return;
      } else if (clickX > width * 0.75) {
        // Tap right edge: next page
        if (currentPage < book.totalPages) {
          onPageChange(currentPage + 1);
        }
        return;
      }
    }

    // Center click toggles distraction-free mode
    onToggleControls();
  };

  // Keyboard navigation for paginated mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentPage > 1) onPageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (currentPage < book.totalPages) onPageChange(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, book.totalPages, onPageChange]);

  // Which pages to render
  const pagesToRender: ParsedPage[] = isContinuous
    ? content.pages
    : content.pages.filter((p) => p.pageNumber === currentPage);

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      className="min-h-screen pt-16 pb-28 px-4 sm:px-6 md:px-8 transition-colors select-text cursor-default"
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
        fontFamily: fontConfig.css,
      }}
    >
      {/* Dimmer overlay for bedtime reading */}
      {settings.brightness < 100 && (
        <div
          className="fixed inset-0 pointer-events-none z-30 transition-opacity"
          style={{
            backgroundColor: '#000000',
            opacity: ((100 - settings.brightness) / 100) * 0.75,
          }}
        />
      )}

      {/* Floating Selection Tooltip */}
      {selectedText && selectionPosition && (
        <div
          className="fixed z-50 flex items-center gap-1 p-1 rounded-xl shadow-2xl backdrop-blur-md border animate-in zoom-in-95"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
            backgroundColor: currentTheme.uiBg,
            borderColor: currentTheme.accent,
            color: currentTheme.text,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Copiar texto"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Speak */}
          <button
            onClick={handleSpeakSelection}
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Ouvir este trecho"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-400/30 mx-0.5" />

          {/* Highlights colors */}
          <button
            onClick={() => handleHighlight('yellow')}
            className="w-5 h-5 rounded-full bg-amber-400 hover:scale-110 transition-transform"
            title="Grifar em amarelo"
          />
          <button
            onClick={() => handleHighlight('green')}
            className="w-5 h-5 rounded-full bg-emerald-400 hover:scale-110 transition-transform"
            title="Grifar em verde"
          />
          <button
            onClick={() => handleHighlight('blue')}
            className="w-5 h-5 rounded-full bg-sky-400 hover:scale-110 transition-transform"
            title="Grifar em azul"
          />
          <button
            onClick={() => handleHighlight('pink')}
            className="w-5 h-5 rounded-full bg-pink-400 hover:scale-110 transition-transform"
            title="Grifar em rosa"
          />
        </div>
      )}

      {/* Main Reading Flow Container */}
      <main
        className={`mx-auto ${maxWidthClass} transition-all duration-200`}
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          letterSpacing: `${settings.letterSpacing}px`,
          textAlign: settings.textAlign,
        }}
      >
        {pagesToRender.length === 0 ? (
          <div className="py-24 text-center opacity-70">
            <p>Nenhum conteúdo encontrado nesta página.</p>
          </div>
        ) : (
          pagesToRender.map((page) => {
            const isBookmarked = bookmarks.some((b) => b.pageNumber === page.pageNumber);

            return (
              <article
                key={page.pageNumber}
                ref={(el) => {
                  if (el) pageRefs.current.set(page.pageNumber, el);
                  else pageRefs.current.delete(page.pageNumber);
                }}
                data-pagenum={page.pageNumber}
                className="relative pb-12 pt-4 transition-all"
              >
                {/* Subtle Page Divider */}
                {settings.showPageDividers && (
                  <div className="flex items-center justify-between py-6 my-4 select-none opacity-50 text-xs font-mono border-t border-b border-black/10 dark:border-white/10">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.accent }} />
                      Página {page.pageNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      {isBookmarked && (
                        <span className="flex items-center gap-1 text-amber-500 font-sans font-semibold text-[11px]">
                          <BookmarkIcon className="w-3.5 h-3.5 fill-current" />
                          Marcada
                        </span>
                      )}
                      <span className="opacity-75">{page.wordCount} palavras</span>
                    </div>
                  </div>
                )}

                {/* Blocks */}
                <div className="space-y-4">
                  {page.blocks.map((block) => {
                    const isTtsActive = ttsState.currentBlockId === block.id;

                    return (
                      <div
                        key={block.id}
                        ref={(el) => {
                          if (el) blockRefs.current.set(block.id, el);
                          else blockRefs.current.delete(block.id);
                        }}
                        className={`transition-all duration-300 rounded-lg px-2 py-1 -mx-2 ${
                          isTtsActive
                            ? 'ring-2 ring-blue-500 bg-blue-500/15 shadow-sm'
                            : ''
                        }`}
                      >
                        {renderBlockContent(block, settings)}
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })
        )}

        {/* Paginated mode navigation buttons at bottom */}
        {!isContinuous && (
          <div className="flex items-center justify-between pt-8 pb-4 border-t border-black/10 dark:border-white/10 select-none">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border text-xs font-semibold disabled:opacity-30 transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: currentTheme.uiBorder }}
            >
              <ChevronLeft className="w-4 h-4" />
              Página Anterior
            </button>

            <span className="text-xs font-mono opacity-60">
              {currentPage} de {book.totalPages}
            </span>

            <button
              onClick={() => onPageChange(Math.min(book.totalPages, currentPage + 1))}
              disabled={currentPage >= book.totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border text-xs font-semibold disabled:opacity-30 transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: currentTheme.uiBorder }}
            >
              Próxima Página
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

function renderBlockContent(block: ParagraphBlock, settings: ReadingSettings): React.ReactNode {
  const content = settings.bionicReading ? renderBionicText(block.text) : block.text;

  switch (block.type) {
    case 'h1':
      return (
        <h2
          className="font-bold tracking-tight mt-6 mb-3 font-serif"
          style={{ fontSize: `${Math.round(settings.fontSize * 1.5)}px` }}
        >
          {content}
        </h2>
      );
    case 'h2':
      return (
        <h3
          className="font-bold tracking-tight mt-5 mb-2 font-serif opacity-95"
          style={{ fontSize: `${Math.round(settings.fontSize * 1.25)}px` }}
        >
          {content}
        </h3>
      );
    case 'h3':
      return (
        <h4
          className="font-semibold tracking-tight mt-4 mb-2 opacity-90"
          style={{ fontSize: `${Math.round(settings.fontSize * 1.1)}px` }}
        >
          {content}
        </h4>
      );
    case 'quote':
      return (
        <blockquote className="border-l-4 border-blue-500/60 pl-4 py-1 italic opacity-90 my-2">
          {content}
        </blockquote>
      );
    case 'p':
    default:
      return (
        <p className="leading-relaxed">
          {content}
        </p>
      );
  }
}
