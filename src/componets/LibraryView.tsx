import React, { useRef, useState } from 'react';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  Clock, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  Search, 
  Plus, 
  Smartphone, 
  Tablet, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { Book, ReadingSettings, THEMES } from '../types/reader';
import { ParseProgress } from '../services/pdfExtractor';
import { PWAInstallButton } from './PWAInstallButton';

interface LibraryViewProps {
  books: Book[];
  onOpenBook: (book: Book) => void;
  onUploadFile: (file: File) => void;
  onDeleteBook: (bookId: string) => void;
  onResetProgress: (bookId: string) => void;
  onLoadSampleBook: (sampleId: string) => void;
  isParsing: boolean;
  parseProgress: ParseProgress | null;
  settings: ReadingSettings;
  onOpenSettings: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  onOpenBook,
  onUploadFile,
  onDeleteBook,
  onResetProgress,
  onLoadSampleBook,
  isParsing,
  parseProgress,
  settings,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentTheme = THEMES[settings.theme];

  // Most recently read book
  const lastReadBook = books.length > 0 ? books[0] : null;

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.author && b.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onUploadFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onUploadFile(file);
      e.target.value = '';
    }
  };

  return (
    <div
      className="min-h-screen pb-20 transition-colors"
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
      }}
    >
      {/* Top Navbar */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md border-b px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm"
        style={{
          backgroundColor: `${currentTheme.uiBg}F0`,
          borderColor: currentTheme.uiBorder,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md font-bold text-white"
            style={{ backgroundColor: currentTheme.accent }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight flex items-center gap-1.5">
              <span>Leitor Reflow PDF</span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold"
                style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}
              >
                Mobile / Tablet
              </span>
            </h1>
            <p className="text-xs opacity-60 hidden sm:block">
              Texto redimensionável e fluído sem zoom desconfortável
            </p>
          </div>
        </div>

        {/* Actions: Install App Button & Upload Button */}
        <div className="flex items-center gap-2">
          <PWAInstallButton settings={settings} />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: currentTheme.accent }}
          >
            <Upload className="w-4 h-4" />
            <span>Abrir PDF</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </header>

      {/* Parsing progress overlay */}
      {isParsing && parseProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl border space-y-4"
            style={{
              backgroundColor: currentTheme.uiBg,
              borderColor: currentTheme.accent,
              color: currentTheme.text,
            }}
          >
            <div
              className="w-14 h-14 rounded-full mx-auto flex items-center justify-center animate-spin"
              style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}
            >
              <Loader2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold">Extraindo e Adaptando PDF</h3>
              <p className="text-xs opacity-75 mt-1">{parseProgress.stage}</p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-300 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${parseProgress.percent}%`,
                    backgroundColor: currentTheme.accent,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono opacity-70">
                <span>Página {parseProgress.currentPage} de {parseProgress.totalPages}</span>
                <span>{parseProgress.percent}%</span>
              </div>
            </div>

            <p className="text-[11px] opacity-60">
              Formatando parágrafos e gerando sumário responsivo...
            </p>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* HERO: Drag and Drop Upload Box */}
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'scale-[1.01] shadow-xl'
              : 'hover:scale-[1.005] hover:shadow-md'
          }`}
          style={{
            borderColor: dragOver ? currentTheme.accent : currentTheme.uiBorder,
            backgroundColor: dragOver ? `${currentTheme.accent}10` : `${currentTheme.uiBg}60`,
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner"
            style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}
          >
            <Upload className="w-6 h-6" />
          </div>
          <h2 className="text-base sm:text-lg font-bold">
            Carregar Novo Livro ou Artigo em PDF
          </h2>
          <p className="text-xs sm:text-sm opacity-70 max-w-md mx-auto mt-1">
            Arraste um PDF aqui ou toque para selecionar do seu celular ou tablet.
            O texto será reformatado instantaneamente para leitura fluída.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] opacity-75">
            <span className="flex items-center gap-1 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full border" style={{ borderColor: currentTheme.uiBorder }}>
              <Smartphone className="w-3.5 h-3.5" /> Telas de Telefone
            </span>
            <span className="flex items-center gap-1 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full border" style={{ borderColor: currentTheme.uiBorder }}>
              <Tablet className="w-3.5 h-3.5" /> Tablets & iPads
            </span>
            <span className="flex items-center gap-1 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full border" style={{ borderColor: currentTheme.uiBorder }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Salvo no Navegador
            </span>
          </div>
        </section>

        {/* HERO BANNER: Continue Reading where you left off */}
        {lastReadBook && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Continuar de Onde Parou
            </h2>

            <div
              className="p-5 rounded-2xl border shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              style={{
                backgroundColor: currentTheme.uiBg,
                borderColor: currentTheme.uiBorder,
              }}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Book Thumbnail Cover */}
                <div
                  className="w-16 h-20 sm:w-20 sm:h-28 rounded-xl shadow-md border overflow-hidden shrink-0 flex items-center justify-center"
                  style={{
                    backgroundColor: `${currentTheme.accent}20`,
                    borderColor: currentTheme.uiBorder,
                  }}
                >
                  {lastReadBook.coverUrl ? (
                    <img
                      src={lastReadBook.coverUrl}
                      alt={lastReadBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-8 h-8 opacity-40" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
                    style={{ backgroundColor: `${currentTheme.accent}25`, color: currentTheme.accent }}
                  >
                    Página {lastReadBook.currentPage} de {lastReadBook.totalPages} ({lastReadBook.scrollProgress}%)
                  </span>

                  <h3 className="text-base sm:text-lg font-bold truncate leading-tight">
                    {lastReadBook.title}
                  </h3>

                  <p className="text-xs opacity-70 truncate">
                    {lastReadBook.author || 'Autor desconhecido'}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full max-w-xs bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(5, lastReadBook.scrollProgress)}%`,
                        backgroundColor: currentTheme.accent,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onOpenBook(lastReadBook)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0"
                style={{ backgroundColor: currentTheme.accent }}
              >
                <BookOpen className="w-4 h-4" />
                Continuar Leitura
              </button>
            </div>
          </section>
        )}

        {/* LIBRARY LIST SECTION */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Sua Estante ({books.length})</h2>
              <p className="text-xs opacity-70">
                Livros guardados no armazenamento local do seu dispositivo
              </p>
            </div>

            {/* Filter input if multiple books */}
            {books.length > 2 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 opacity-50" />
                <input
                  type="text"
                  placeholder="Filtrar livros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border bg-black/5 dark:bg-white/5 focus:outline-none"
                  style={{ borderColor: currentTheme.uiBorder }}
                />
              </div>
            )}
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-12 border rounded-2xl opacity-60 text-xs" style={{ borderColor: currentTheme.uiBorder }}>
              Nenhum livro encontrado nesta estante. Carregue um PDF acima ou escolha um dos livros de exemplo abaixo!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((book) => {
                const percent = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;

                return (
                  <div
                    key={book.id}
                    className="p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    style={{
                      backgroundColor: currentTheme.uiBg,
                      borderColor: currentTheme.uiBorder,
                    }}
                  >
                    <div className="flex gap-3">
                      {/* Cover Thumbnail */}
                      <div
                        onClick={() => onOpenBook(book)}
                        className="w-16 h-22 rounded-xl border overflow-hidden shrink-0 flex items-center justify-center cursor-pointer shadow-sm group-hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: `${currentTheme.accent}15`,
                          borderColor: currentTheme.uiBorder,
                        }}
                      >
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-7 h-7 opacity-40" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h3
                          onClick={() => onOpenBook(book)}
                          className="text-sm font-bold truncate leading-snug cursor-pointer hover:underline"
                          title={book.title}
                        >
                          {book.title}
                        </h3>
                        <p className="text-xs opacity-70 truncate mt-0.5">
                          {book.author || 'Autor não informado'}
                        </p>

                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono opacity-70">
                            <span>Pág. {book.currentPage}/{book.totalPages}</span>
                            <span className="font-bold">{percent}%</span>
                          </div>
                          <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.max(4, percent)}%`,
                                backgroundColor: currentTheme.accent,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: `${currentTheme.uiBorder}80` }}>
                      <button
                        onClick={() => onOpenBook(book)}
                        className="font-bold flex items-center gap-1 transition-colors hover:underline"
                        style={{ color: currentTheme.accent }}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Ler agora
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onResetProgress(book.id)}
                          className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          title="Reiniciar leitura para pág. 1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteBook(book.id)}
                          className="p-1.5 rounded-lg text-red-500 opacity-60 hover:opacity-100 hover:bg-red-500/10 transition-colors"
                          title="Excluir livro da estante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* READY-TO-READ CLASSIC SAMPLES */}
        <section className="space-y-3 pt-4 border-t" style={{ borderColor: currentTheme.uiBorder }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold">Livros e Textos de Demonstração</h2>
          </div>
          <p className="text-xs opacity-70">
            Experimente o reflow imediatamente mesmo sem ter um PDF no aparelho:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onLoadSampleBook('sample_dom_casmurro')}
              className="p-4 rounded-2xl border text-left flex items-start gap-3 transition-all hover:scale-[1.01] hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: currentTheme.uiBorder }}
            >
              <div
                className="w-10 h-14 rounded-lg flex items-center justify-center font-serif text-lg font-bold shrink-0 shadow-sm"
                style={{ backgroundColor: `${currentTheme.accent}25`, color: currentTheme.accent }}
              >
                DC
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">Dom Casmurro</div>
                <div className="text-xs opacity-70">Machado de Assis • Clássico da literatura</div>
                <div className="text-[11px] font-semibold mt-1" style={{ color: currentTheme.accent }}>
                  Abrir amostra gratuita →
                </div>
              </div>
            </button>

            <button
              onClick={() => onLoadSampleBook('sample_guia_leitor')}
              className="p-4 rounded-2xl border text-left flex items-start gap-3 transition-all hover:scale-[1.01] hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: currentTheme.uiBorder }}
            >
              <div
                className="w-10 h-14 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-sm"
                style={{ backgroundColor: '#10B98125', color: '#10B981' }}
              >
                GUIA
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">Manual do Leitor Reflow</div>
                <div className="text-xs opacity-70">Dicas para leitura em telas pequenas e recursos</div>
                <div className="text-[11px] font-semibold text-emerald-500 mt-1">
                  Abrir guia ilustrado →
                </div>
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
