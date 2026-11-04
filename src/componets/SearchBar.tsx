import React, { useState, useMemo } from 'react';
import { Search, X, ChevronRight, FileText } from 'lucide-react';
import { ParsedBookContent, ReadingSettings, THEMES } from '../types/reader';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  content: ParsedBookContent;
  settings: ReadingSettings;
  onSelectResult: (pageNumber: number, blockId: string) => void;
}

interface SearchResult {
  pageNumber: number;
  blockId: string;
  before: string;
  match: string;
  after: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isOpen,
  onClose,
  content,
  settings,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const currentTheme = THEMES[settings.theme];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const matches: SearchResult[] = [];

    for (const page of content.pages) {
      for (const block of page.blocks) {
        const text = block.text;
        const lower = text.toLowerCase();
        let pos = lower.indexOf(q);

        while (pos !== -1 && matches.length < 100) {
          const start = Math.max(0, pos - 40);
          const end = Math.min(text.length, pos + q.length + 50);

          matches.push({
            pageNumber: page.pageNumber,
            blockId: block.id,
            before: (start > 0 ? '…' : '') + text.substring(start, pos),
            match: text.substring(pos, pos + q.length),
            after: text.substring(pos + q.length, end) + (end < text.length ? '…' : ''),
          });

          pos = lower.indexOf(q, pos + q.length);
        }
      }
    }

    return matches;
  }, [query, content]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm pt-12 sm:pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95"
        style={{
          backgroundColor: currentTheme.uiBg,
          color: currentTheme.text,
          border: `1px solid ${currentTheme.uiBorder}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: currentTheme.uiBorder }}>
          <Search className="w-5 h-5 opacity-60 ml-1" />
          <input
            type="text"
            placeholder="Pesquisar palavras ou frases no livro..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:opacity-50"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              title="Limpar busca"
            >
              <X className="w-4 h-4 opacity-70" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            Fechar
          </button>
        </div>

        {/* Results Counter */}
        <div className="px-4 py-2 text-xs font-medium border-b opacity-75 flex items-center justify-between" style={{ borderColor: currentTheme.uiBorder }}>
          <span>
            {query.trim().length >= 2
              ? `${results.length} ocorrência(s) encontrada(s)`
              : 'Digite pelo menos 2 caracteres'}
          </span>
          {results.length >= 100 && <span className="text-[10px] text-amber-500">Limite de 100 resultados atingido</span>}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {results.map((res, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectResult(res.pageNumber, res.blockId);
                onClose();
              }}
              className="w-full text-left p-3 rounded-xl border transition-all hover:scale-[1.01] hover:bg-black/5 dark:hover:bg-white/5 flex items-start justify-between gap-3"
              style={{ borderColor: currentTheme.uiBorder }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}
                  >
                    Página {res.pageNumber}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  <span>{res.before}</span>
                  <span className="font-extrabold bg-amber-400/40 text-amber-900 dark:text-amber-200 px-1 py-0.5 rounded">
                    {res.match}
                  </span>
                  <span>{res.after}</span>
                </p>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40 shrink-0 mt-1" />
            </button>
          ))}

          {query.trim().length >= 2 && results.length === 0 && (
            <div className="text-center py-12 opacity-60 text-xs">
              Nenhum trecho com o termo "{query}" foi encontrado neste documento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
