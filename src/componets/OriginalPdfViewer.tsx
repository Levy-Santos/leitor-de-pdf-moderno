import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { pdfjsLib } from '../services/pdfWorker';
import { ReadingSettings, THEMES } from '../types/reader';

interface OriginalPdfViewerProps {
  pdfData: ArrayBuffer;
  currentPage: number;
  totalPages: number;
  settings: ReadingSettings;
  onPageChange: (page: number) => void;
}

export const OriginalPdfViewer: React.FC<OriginalPdfViewerProps> = ({
  pdfData,
  currentPage,
  totalPages,
  settings,
  onPageChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  const [renderError, setRenderError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);

  const currentTheme = THEMES[settings.theme];

  // Initialize or update PDF document instance
  useEffect(() => {
    let isCancelled = false;
    pdfDocRef.current = null;

    if (!pdfData || pdfData.byteLength === 0) return;

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfData.slice(0)),
      cMapUrl: 'https://unpkg.com/pdfjs-dist@' + pdfjsLib.version + '/cmaps/',
      cMapPacked: true,
    });

    loadingTask.promise.then((pdf) => {
      if (!isCancelled) {
        pdfDocRef.current = pdf;
        renderCurrentPage();
      }
    }).catch((err) => {
      if (!isCancelled) {
        console.error('Error loading PDF document for preview:', err);
        setRenderError('Erro ao inicializar visualizador do PDF original.');
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [pdfData]);

  const renderCurrentPage = useCallback(async () => {
    if (!canvasRef.current || !pdfDocRef.current) return;
    setLoading(true);
    setRenderError(null);

    try {
      const page = await pdfDocRef.current.getPage(currentPage);
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
      const unscaledViewport = page.getViewport({ scale: 1.0 });

      // Fit to container width by default with padding
      const baseScale = Math.min(2.5, Math.max(0.6, (containerWidth - 32) / unscaledViewport.width));
      const effectiveScale = baseScale * scale;
      const viewport = page.getViewport({ scale: effectiveScale });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      setLoading(false);
    } catch (err: unknown) {
      console.error('Error rendering original PDF page:', err);
      setLoading(false);
      setRenderError('Não foi possível renderizar a página do PDF original.');
    }
  }, [currentPage, scale]);

  // Re-render when currentPage or scale changes and doc is ready
  useEffect(() => {
    if (pdfDocRef.current) {
      renderCurrentPage();
    }
  }, [currentPage, scale, renderCurrentPage]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen pt-16 pb-24 px-2 sm:px-4 flex flex-col items-center justify-start overflow-auto"
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
      }}
    >
      {/* Zoom and page bar */}
      <div
        className="sticky top-16 z-20 my-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-md flex items-center gap-2 text-xs font-semibold"
        style={{
          backgroundColor: `${currentTheme.uiBg}E6`,
          borderColor: currentTheme.uiBorder,
          color: currentTheme.text,
        }}
      >
        <button
          onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
          className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          title="Diminuir zoom"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="font-mono text-xs">{Math.round(scale * 100)}%</span>

        <button
          onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
          className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          title="Aumentar zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => setScale(1.0)}
          className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ml-1"
          title="Ajustar à tela"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <span className="opacity-40">|</span>

        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30"
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span>{currentPage} / {totalPages}</span>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30"
          title="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-8 text-xs font-medium opacity-70">
          <Loader2 className="w-4 h-4 animate-spin" />
          Renderizando folha original do PDF...
        </div>
      )}

      {renderError && (
        <div className="py-8 text-center text-xs text-red-400">
          {renderError}
        </div>
      )}

      {/* Render Canvas */}
      <div className="shadow-2xl rounded-lg overflow-hidden border border-black/10 dark:border-white/10 my-2 max-w-full">
        <canvas ref={canvasRef} className="block mx-auto max-w-full h-auto bg-white" />
      </div>
    </div>
  );
};
