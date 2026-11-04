import React, { useState } from 'react';
import { 
  X, 
  List, 
  Bookmark as BookmarkIcon, 
  Highlighter, 
  Trash2, 
  ChevronRight, 
  BookOpen 
} from 'lucide-react';
import { Bookmark, Highlight, ReadingSettings, THEMES, TocItem } from '../types/reader';

interface TocDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  toc: TocItem[];
  bookmarks: Bookmark[];
  highlights: Highlight[];
  currentPage: number;
  totalPages: number;
  settings: ReadingSettings;
  onSelectPage: (page: number) => void;
  onDeleteBookmark: (id: string) => void;
  onDeleteHighlight: (id: string) => void;
}

export const TocDrawer: React.FC<TocDrawerProps> = ({
  isOpen,
  onClose,
  toc,
  bookmarks,
  highlights,
  currentPage,
  totalPages,
  settings,
  onSelectPage,
  onDeleteBookmark,
  onDeleteHighlight,
}) => {
  const [activeTab, setActiveTab] = useState<'toc' | 'bookmarks' | 'highlights'>('toc');
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const currentTheme = THEMES[settings.theme];

  const filteredToc = toc.filter((item) =>
    item.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full flex flex-col shadow-2xl transition-transform animate-in slide-in-from-right"
        style={{
          backgroundColor: currentTheme.uiBg,
          color: currentTheme.text,
          borderLeft: `1px solid ${currentTheme.uiBorder}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: currentTheme.uiBorder }}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: currentTheme.accent }} />
            <h2 className="text-base font-bold">Navegação do Livro</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Fechar gaveta"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 border-b text-xs font-semibold" style={{ borderColor: currentTheme.uiBorder }}>
          <button
            onClick={() => setActiveTab('toc')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'toc'
                ? 'border-blue-500 font-bold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{
              borderColor: activeTab === 'toc' ? currentTheme.accent : 'transparent',
              color: activeTab === 'toc' ? currentTheme.accent : undefined,
            }}
          >
            <List className="w-4 h-4" />
            Sumário ({toc.length})
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'bookmarks'
                ? 'border-blue-500 font-bold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{
              borderColor: activeTab === 'bookmarks' ? currentTheme.accent : 'transparent',
              color: activeTab === 'bookmarks' ? currentTheme.accent : undefined,
            }}
          >
            <BookmarkIcon className="w-4 h-4" />
            Marcadores ({bookmarks.length})
          </button>

          <button
            onClick={() => setActiveTab('highlights')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'highlights'
                ? 'border-blue-500 font-bold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{
              borderColor: activeTab === 'highlights' ? currentTheme.accent : 'transparent',
              color: activeTab === 'highlights' ? currentTheme.accent : undefined,
            }}
          >
            <Highlighter className="w-4 h-4" />
            Destaques ({highlights.length})
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* TAB 1: TOC */}
          {activeTab === 'toc' && (
            <>
              {toc.length > 8 && (
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Filtrar capítulos..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-black/5 dark:bg-white/5 focus:outline-none"
                    style={{ borderColor: currentTheme.uiBorder }}
                  />
                </div>
              )}

              {filteredToc.length === 0 ? (
                <div className="text-center py-12 opacity-60 text-xs">
                  {toc.length === 0
                    ? 'Nenhum sumário ou capítulo identificado automaticamente no PDF. Use o controle de páginas abaixo para navegar.'
                    : 'Nenhum capítulo corresponde ao filtro.'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredToc.map((item, idx) => {
                    const isCurrent = currentPage === item.pageNumber;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectPage(item.pageNumber);
                          onClose();
                        }}
                        className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 text-sm transition-all ${
                          isCurrent
                            ? 'font-bold shadow-sm'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-85 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: isCurrent ? `${currentTheme.accent}20` : 'transparent',
                          color: isCurrent ? currentTheme.accent : undefined,
                          paddingLeft: item.level > 1 ? `${item.level * 16}px` : undefined,
                        }}
                      >
                        <span className="truncate flex-1">{item.title}</span>
                        <span className="text-xs opacity-60 shrink-0 font-mono">
                          Pág. {item.pageNumber}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-2">
              {bookmarks.length === 0 ? (
                <div className="text-center py-12 opacity-60 text-xs">
                  Nenhum marcador adicionado ainda. Toque no ícone de marcador na barra superior enquanto lê para salvar uma página.
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-3 rounded-xl border flex items-start justify-between gap-2 transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    style={{ borderColor: currentTheme.uiBorder }}
                    onClick={() => {
                      onSelectPage(bm.pageNumber);
                      onClose();
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${currentTheme.accent}25`, color: currentTheme.accent }}
                        >
                          Página {bm.pageNumber}
                        </span>
                        <span className="text-[10px] opacity-50">
                          {new Date(bm.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs line-clamp-2 italic opacity-80">"{bm.snippet}"</p>
                      {bm.note && (
                        <p className="text-xs font-semibold mt-1" style={{ color: currentTheme.accent }}>
                          Nota: {bm.note}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBookmark(bm.id);
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Excluir marcador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: HIGHLIGHTS */}
          {activeTab === 'highlights' && (
            <div className="space-y-2">
              {highlights.length === 0 ? (
                <div className="text-center py-12 opacity-60 text-xs">
                  Nenhum trecho destacado. Selecione qualquer trecho de texto no leitor para destacar ou adicionar anotações.
                </div>
              ) : (
                highlights.map((hl) => (
                  <div
                    key={hl.id}
                    className="p-3 rounded-xl border flex items-start justify-between gap-2 transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    style={{ borderColor: currentTheme.uiBorder }}
                    onClick={() => {
                      onSelectPage(hl.pageNumber);
                      onClose();
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              hl.color === 'yellow'
                                ? '#EAB308'
                                : hl.color === 'green'
                                ? '#22C55E'
                                : hl.color === 'blue'
                                ? '#3B82F6'
                                : '#EC4899',
                          }}
                        />
                        <span className="text-xs font-bold opacity-80">Página {hl.pageNumber}</span>
                      </div>
                      <p className="text-xs line-clamp-3 font-medium opacity-90">"{hl.text}"</p>
                      {hl.note && (
                        <p className="text-xs font-semibold mt-1" style={{ color: currentTheme.accent }}>
                          {hl.note}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHighlight(hl.id);
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Remover destaque"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t text-center text-xs opacity-60" style={{ borderColor: currentTheme.uiBorder }}>
          Total de {totalPages} páginas • Posição atual: pág. {currentPage}
        </div>
      </div>
    </div>
  );
};
