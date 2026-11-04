import React from 'react';
import { 
  ArrowLeft, 
  Menu, 
  Search, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  FileText, 
  BookOpen, 
  Maximize2, 
  Minimize2 
} from 'lucide-react';
import { Book, ReadingSettings, THEMES } from '../types/reader';

interface HeaderNavProps {
  book: Book;
  settings: ReadingSettings;
  visible: boolean;
  onBackToLibrary: () => void;
  onOpenToc: () => void;
  onOpenSearch: () => void;
  onToggleBookmark: () => void;
  isCurrentPageBookmarked: boolean;
  isTtsPlaying: boolean;
  onToggleTts: () => void;
  isOriginalPdfView: boolean;
  onToggleOriginalPdf: () => void;
  hasOriginalPdf: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  book,
  settings,
  visible,
  onBackToLibrary,
  onOpenToc,
  onOpenSearch,
  onToggleBookmark,
  isCurrentPageBookmarked,
  isTtsPlaying,
  onToggleTts,
  isOriginalPdfView,
  onToggleOriginalPdf,
  hasOriginalPdf,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const currentTheme = THEMES[settings.theme];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 backdrop-blur-md shadow-md ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{
        backgroundColor: `${currentTheme.uiBg}F2`,
        color: currentTheme.text,
        borderBottom: `1px solid ${currentTheme.uiBorder}`,
      }}
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={onBackToLibrary}
            className="p-2 -ml-1 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 shrink-0"
            title="Voltar à Biblioteca"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-semibold">Biblioteca</span>
          </button>

          <div className="min-w-0 pr-2">
            <h1 className="text-sm font-semibold truncate leading-tight">{book.title}</h1>
            <p className="text-[11px] opacity-70 truncate">{book.author || 'PDF sem autor'}</p>
          </div>
        </div>

        {/* Center / Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Reflow vs Original PDF switch (if original PDF data is available) */}
          {hasOriginalPdf && (
            <button
              onClick={onToggleOriginalPdf}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isOriginalPdfView
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'hover:bg-black/10 dark:hover:bg-white/10 opacity-80'
              }`}
              title={isOriginalPdfView ? 'Voltar para Modo Texto Reflow' : 'Ver PDF Original'}
            >
              {isOriginalPdfView ? <BookOpen className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              <span className="hidden md:inline">
                {isOriginalPdfView ? 'Modo Texto' : 'PDF Original'}
              </span>
            </button>
          )}

          {/* TTS Audio Narration */}
          <button
            onClick={onToggleTts}
            className={`p-2 rounded-xl transition-all ${
              isTtsPlaying
                ? 'bg-blue-600 text-white animate-pulse'
                : 'hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
            }`}
            title={isTtsPlaying ? 'Pausar narração em voz' : 'Ouvir página (Leitura em voz alta)'}
          >
            {isTtsPlaying ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
          </button>

          {/* Search */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100 transition-colors"
            title="Buscar no livro"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Bookmark */}
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-xl transition-colors ${
              isCurrentPageBookmarked
                ? 'text-amber-500 fill-amber-500'
                : 'hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
            }`}
            title={isCurrentPageBookmarked ? 'Remover Marcador' : 'Adicionar Marcador de Página'}
          >
            <Bookmark className={`w-4.5 h-4.5 ${isCurrentPageBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100 transition-colors"
            title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
          </button>

          {/* Table of Contents & Menu */}
          <button
            onClick={onOpenToc}
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100 transition-colors ml-0.5"
            title="Sumário e Marcadores"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
