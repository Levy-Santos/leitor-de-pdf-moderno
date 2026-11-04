import React from 'react';
import { Minus, Plus, Settings2, Sliders, ChevronLeft, ChevronRight } from 'lucide-react';
import { Book, ReadingSettings, THEMES, ThemeMode } from '../types/reader';

interface BottomToolbarProps {
  book: Book;
  settings: ReadingSettings;
  visible: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onUpdateSettings: (updater: (prev: ReadingSettings) => ReadingSettings) => void;
  onOpenAppearance: () => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  book,
  settings,
  visible,
  currentPage,
  totalPages,
  onPageChange,
  onUpdateSettings,
  onOpenAppearance,
}) => {
  const currentTheme = THEMES[settings.theme];

  // Calculate percentage and reading time left
  const currentPercent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
  const wordsLeft = Math.max(0, Math.round((book.totalWords / Math.max(1, totalPages)) * (totalPages - currentPage)));
  const minutesLeft = Math.max(1, Math.ceil(wordsLeft / (settings.readingSpeedWpm || 200)));

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 backdrop-blur-md shadow-lg ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{
        backgroundColor: `${currentTheme.uiBg}F2`,
        color: currentTheme.text,
        borderTop: `1px solid ${currentTheme.uiBorder}`,
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-2.5 space-y-2">
        {/* Progress Bar & Page Scrubber */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium opacity-80 px-1">
            <span className="flex items-center gap-1.5">
              <span>Pág. <strong>{currentPage}</strong> de {totalPages}</span>
              <span className="opacity-50">•</span>
              <span className="font-bold" style={{ color: currentTheme.accent }}>{currentPercent}%</span>
            </span>
            <span className="text-[11px] opacity-75">
              {currentPage >= totalPages ? 'Livro concluído! 🎉' : `≈ ${minutesLeft} min restantes`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-colors shrink-0"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="1"
              max={Math.max(1, totalPages)}
              value={currentPage}
              onChange={(e) => onPageChange(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-300 dark:bg-slate-700 rounded-lg"
              title="Navegar pelas páginas"
            />

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-colors shrink-0"
              title="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick controls row: Quick Font size, Quick Themes, Aa settings button */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t" style={{ borderColor: `${currentTheme.uiBorder}80` }}>
          {/* Quick Font Size Controls: Instant tap A- and A+ */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-xl p-0.5 border" style={{ borderColor: currentTheme.uiBorder }}>
            <button
              onClick={() => onUpdateSettings((s) => ({ ...s, fontSize: Math.max(13, s.fontSize - 1) }))}
              disabled={settings.fontSize <= 13}
              className="px-2 py-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 flex items-center gap-0.5 text-xs font-bold transition-colors"
              title="Diminuir fonte (A-)"
            >
              <Minus className="w-3 h-3" />
              <span>A</span>
            </button>
            <span className="px-2 text-xs font-mono font-bold min-w-[38px] text-center" style={{ color: currentTheme.accent }}>
              {settings.fontSize}
            </span>
            <button
              onClick={() => onUpdateSettings((s) => ({ ...s, fontSize: Math.min(34, s.fontSize + 1) }))}
              disabled={settings.fontSize >= 34}
              className="px-2 py-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 flex items-center gap-0.5 text-xs font-bold transition-colors"
              title="Aumentar fonte (A+)"
            >
              <Plus className="w-3 h-3" />
              <span className="text-sm">A</span>
            </button>
          </div>

          {/* Quick Themes dots */}
          <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-xl border" style={{ borderColor: currentTheme.uiBorder }}>
            {(['dark', 'amoled', 'sepia', 'solarized', 'light'] as ThemeMode[]).map((mode) => {
              const theme = THEMES[mode];
              const isSelected = settings.theme === mode;
              return (
                <button
                  key={mode}
                  onClick={() => onUpdateSettings((s) => ({ ...s, theme: mode }))}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? 'ring-2 ring-offset-1 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: isSelected ? theme.accent : currentTheme.uiBorder,
                  }}
                  title={`Tema: ${theme.name}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                </button>
              );
            })}
          </div>

          {/* Detailed Customization Aa button */}
          <button
            onClick={onOpenAppearance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
            style={{
              backgroundColor: `${currentTheme.accent}20`,
              borderColor: currentTheme.accent,
              color: currentTheme.accent,
            }}
            title="Ajustes avançados de tipografia e leitura"
          >
            <span className="font-serif text-sm font-bold">Aa</span>
            <span className="hidden sm:inline">Ajustes</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
