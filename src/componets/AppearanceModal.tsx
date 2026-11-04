import React from 'react';
import { 
  X, 
  Type, 
  Sun, 
  Moon, 
  Smartphone, 
  Eye, 
  AlignLeft, 
  AlignJustify, 
  Minus, 
  Plus, 
  BookOpen, 
  Columns,
  Sparkles
} from 'lucide-react';
import { 
  ReadingSettings, 
  ThemeMode, 
  FontFamilyKey, 
  ColumnWidth, 
  ReadingMode, 
  THEMES, 
  FONT_CONFIGS 
} from '../types/reader';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReadingSettings;
  onUpdateSettings: (updater: (prev: ReadingSettings) => ReadingSettings) => void;
}

export const AppearanceModal: React.FC<AppearanceModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const currentTheme = THEMES[settings.theme];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl p-6 overflow-y-auto shadow-2xl transition-transform"
        style={{
          backgroundColor: currentTheme.uiBg,
          color: currentTheme.text,
          border: `1px solid ${currentTheme.uiBorder}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: currentTheme.uiBorder }}>
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5" style={{ color: currentTheme.accent }} />
            <h2 className="text-lg font-bold">Personalizar Leitura</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 pt-5">
          {/* THEMES */}
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase block mb-2.5 opacity-80">
              Tema de Cor & Contraste
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(THEMES) as ThemeMode[]).map((mode) => {
                const theme = THEMES[mode];
                const isSelected = settings.theme === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => onUpdateSettings((s) => ({ ...s, theme: mode }))}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-sm font-medium transition-all ${
                      isSelected ? 'ring-2 ring-offset-1 scale-[1.02]' : 'opacity-85 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: theme.bg,
                      color: theme.text,
                      borderColor: isSelected ? theme.accent : currentTheme.uiBorder,
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <span className="truncate text-xs">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FONT SIZE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold tracking-wider uppercase opacity-80">
                Tamanho da Fonte
              </label>
              <span className="text-sm font-mono font-bold" style={{ color: currentTheme.accent }}>
                {settings.fontSize}px
              </span>
            </div>
            <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-2 rounded-xl">
              <button
                onClick={() =>
                  onUpdateSettings((s) => ({
                    ...s,
                    fontSize: Math.max(13, s.fontSize - 1),
                  }))
                }
                disabled={settings.fontSize <= 13}
                className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
                title="Diminuir fonte"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="13"
                max="34"
                step="1"
                value={settings.fontSize}
                onChange={(e) =>
                  onUpdateSettings((s) => ({
                    ...s,
                    fontSize: Number(e.target.value),
                  }))
                }
                className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-300 dark:bg-slate-700 rounded-lg"
              />
              <button
                onClick={() =>
                  onUpdateSettings((s) => ({
                    ...s,
                    fontSize: Math.min(34, s.fontSize + 1),
                  }))
                }
                disabled={settings.fontSize >= 34}
                className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
                title="Aumentar fonte"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* FONT FAMILY */}
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase block mb-2 opacity-80">
              Família Tipográfica
            </label>
            <div className="space-y-1.5">
              {(Object.keys(FONT_CONFIGS) as FontFamilyKey[]).map((key) => {
                const font = FONT_CONFIGS[key];
                const isSelected = settings.fontFamily === key;
                return (
                  <button
                    key={key}
                    onClick={() => onUpdateSettings((s) => ({ ...s, fontFamily: key }))}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected ? 'ring-2' : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={{
                      borderColor: isSelected ? currentTheme.accent : currentTheme.uiBorder,
                      fontFamily: font.css,
                    }}
                  >
                    <div>
                      <div className="text-base font-semibold">{font.name}</div>
                      <div className="text-xs opacity-75">{font.description}</div>
                    </div>
                    {isSelected && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: currentTheme.accent, color: '#fff' }}
                      >
                        Ativo
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LINE HEIGHT & SPACING */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2 opacity-80">
                Espaço Entre Linhas
              </label>
              <div className="grid grid-cols-3 gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                {[1.5, 1.8, 2.2].map((lh, idx) => (
                  <button
                    key={lh}
                    onClick={() => onUpdateSettings((s) => ({ ...s, lineHeight: lh }))}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      settings.lineHeight === lh
                        ? 'shadow-sm text-white'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: settings.lineHeight === lh ? currentTheme.accent : 'transparent',
                    }}
                  >
                    {idx === 0 ? 'Compacto' : idx === 1 ? 'Normal' : 'Amplo'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2 opacity-80">
                Alinhamento
              </label>
              <div className="grid grid-cols-2 gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                <button
                  onClick={() => onUpdateSettings((s) => ({ ...s, textAlign: 'left' }))}
                  className={`py-1.5 flex items-center justify-center gap-1 text-xs font-semibold rounded-lg transition-all ${
                    settings.textAlign === 'left' ? 'text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: settings.textAlign === 'left' ? currentTheme.accent : 'transparent',
                  }}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  Esquerda
                </button>
                <button
                  onClick={() => onUpdateSettings((s) => ({ ...s, textAlign: 'justify' }))}
                  className={`py-1.5 flex items-center justify-center gap-1 text-xs font-semibold rounded-lg transition-all ${
                    settings.textAlign === 'justify' ? 'text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: settings.textAlign === 'justify' ? currentTheme.accent : 'transparent',
                  }}
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                  Justificado
                </button>
              </div>
            </div>
          </div>

          {/* COLUMN WIDTH / MARGINS */}
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase block mb-2 opacity-80">
              Largura da Coluna de Texto
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-black/5 dark:bg-white/5 p-1.5 rounded-xl">
              {(['narrow', 'medium', 'wide', 'full'] as ColumnWidth[]).map((w) => {
                const labels: Record<ColumnWidth, string> = {
                  narrow: 'Estreita',
                  medium: 'Padrão',
                  wide: 'Larga',
                  full: 'Total',
                };
                const isSelected = settings.columnWidth === w;
                return (
                  <button
                    key={w}
                    onClick={() => onUpdateSettings((s) => ({ ...s, columnWidth: w }))}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                      isSelected ? 'text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? currentTheme.accent : 'transparent',
                    }}
                  >
                    {labels[w]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BIONIC READING TOGGLE */}
          <div className="p-3.5 rounded-xl border flex items-center justify-between" style={{ borderColor: currentTheme.uiBorder }}>
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Leitura Biônica</div>
                <div className="text-xs opacity-70">Destaca o início das palavras para leitura até 2x mais rápida</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.bionicReading}
                onChange={(e) => onUpdateSettings((s) => ({ ...s, bionicReading: e.target.checked }))}
                className="sr-only peer"
              />
              <div 
                className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-slate-700 peer-checked:bg-blue-600"
                style={{ backgroundColor: settings.bionicReading ? currentTheme.accent : undefined }}
              />
            </label>
          </div>

          {/* BRIGHTNESS DIMMER (Bedtime reading filter) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold tracking-wider uppercase opacity-80 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" /> Brilho Noturno do Leitor
              </label>
              <span className="text-xs font-mono">{settings.brightness}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="5"
              value={settings.brightness}
              onChange={(e) =>
                onUpdateSettings((s) => ({
                  ...s,
                  brightness: Number(e.target.value),
                }))
              }
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-300 dark:bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[11px] opacity-60 mt-1">
              <span>Mais escuro (cama)</span>
              <span>100% normal</span>
            </div>
          </div>

          {/* READING MODE */}
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase block mb-2 opacity-80">
              Modo de Navegação
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings((s) => ({ ...s, readingMode: 'continuous' }))}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  settings.readingMode === 'continuous' ? 'text-white' : 'opacity-70'
                }`}
                style={{
                  backgroundColor: settings.readingMode === 'continuous' ? currentTheme.accent : 'transparent',
                  borderColor: currentTheme.uiBorder,
                }}
              >
                <BookOpen className="w-4 h-4" />
                Rolagem Contínua
              </button>
              <button
                onClick={() => onUpdateSettings((s) => ({ ...s, readingMode: 'paginated' }))}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  settings.readingMode === 'paginated' ? 'text-white' : 'opacity-70'
                }`}
                style={{
                  backgroundColor: settings.readingMode === 'paginated' ? currentTheme.accent : 'transparent',
                  borderColor: currentTheme.uiBorder,
                }}
              >
                <Columns className="w-4 h-4" />
                Página por Página
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
