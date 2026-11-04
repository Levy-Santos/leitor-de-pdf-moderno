import { pdfjsLib } from './pdfWorker';
import { Book, ParagraphBlock, ParsedBookContent, ParsedPage, TocItem } from '../types/reader';

export interface ParseProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
  stage: string;
}

interface RawTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
}

export async function parsePdfFile(
  fileData: ArrayBuffer,
  fileName: string,
  onProgress?: (progress: ParseProgress) => void
): Promise<{ book: Book; content: ParsedBookContent }> {
  // Load PDF with pdfjsLib - clone array buffer so original remains intact
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(fileData.slice(0)),
    cMapUrl: 'https://unpkg.com/pdfjs-dist@' + pdfjsLib.version + '/cmaps/',
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  let title = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  let author = 'Autor desconhecido';

  try {
    const metadata = await pdf.getMetadata();
    const info = metadata?.info as Record<string, unknown> | undefined;
    if (info?.Title && typeof info.Title === 'string' && info.Title.trim().length > 1) {
      title = info.Title.trim();
    }
    if (info?.Author && typeof info.Author === 'string' && info.Author.trim().length > 1) {
      author = info.Author.trim();
    }
  } catch {
    // metadata is optional
  }

  // Generate thumbnail from first page
  let coverUrl = '';
  try {
    const firstPage = await pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      // @ts-expect-error - canvas render
      await firstPage.render({ canvasContext: ctx, viewport }).promise;
      coverUrl = canvas.toDataURL('image/jpeg', 0.85);
    }
  } catch (e) {
    console.warn('Could not generate cover thumbnail:', e);
  }

  const parsedPages: ParsedPage[] = [];
  const detectedHeadings: TocItem[] = [];
  let totalWordCount = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (onProgress) {
      onProgress({
        currentPage: pageNum,
        totalPages,
        percent: Math.round((pageNum / totalPages) * 90),
        stage: `Processando página ${pageNum} de ${totalPages}...`,
      });
    }

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });
    const pageHeight = viewport.height;

    const rawItems: RawTextItem[] = [];

    for (const item of textContent.items) {
      // Check if item has transform & str
      if ('str' in item && typeof item.str === 'string' && item.str.trim()) {
        const tx = item.transform[4];
        const ty = item.transform[5];
        const height = item.height || Math.hypot(item.transform[2], item.transform[3]) || 12;
        const width = item.width || 0;

        rawItems.push({
          str: item.str,
          x: tx,
          y: ty,
          width,
          height,
          fontName: item.fontName || '',
        });
      }
    }

    const { blocks, rawText, wordCount, headings } = processPageItems(rawItems, pageNum, pageHeight);
    totalWordCount += wordCount;

    for (const h of headings) {
      detectedHeadings.push(h);
    }

    parsedPages.push({
      pageNumber: pageNum,
      blocks,
      rawText,
      wordCount,
    });
  }

  // Attempt to extract PDF Outline
  const toc: TocItem[] = [];
  try {
    const outline = await pdf.getOutline();
    if (outline && outline.length > 0) {
      for (const item of outline) {
        let destPage = 1;
        if (typeof item.dest === 'string') {
          const destObj = await pdf.getDestination(item.dest);
          if (destObj && destObj[0]) {
            const pageIndex = await pdf.getPageIndex(destObj[0]);
            destPage = pageIndex + 1;
          }
        } else if (Array.isArray(item.dest) && item.dest[0]) {
          const pageIndex = await pdf.getPageIndex(item.dest[0]);
          destPage = pageIndex + 1;
        }

        toc.push({
          title: item.title,
          pageNumber: destPage,
          level: 1,
        });

        // Sub items if any
        if (item.items && Array.isArray(item.items)) {
          for (const sub of item.items) {
            let subPage = destPage;
            if (typeof sub.dest === 'string') {
              const subDestObj = await pdf.getDestination(sub.dest);
              if (subDestObj && subDestObj[0]) {
                const pIdx = await pdf.getPageIndex(subDestObj[0]);
                subPage = pIdx + 1;
              }
            } else if (Array.isArray(sub.dest) && sub.dest[0]) {
              const pIdx = await pdf.getPageIndex(sub.dest[0]);
              subPage = pIdx + 1;
            }
            toc.push({
              title: sub.title,
              pageNumber: subPage,
              level: 2,
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn('Could not read PDF outline:', e);
  }

  // If no formal PDF outline was found, use intelligent detected headings
  const finalToc = toc.length > 0 ? toc : detectedHeadings.slice(0, 50);

  const bookId = 'book_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

  const book: Book = {
    id: bookId,
    title,
    author: author || 'Autor não informado',
    totalPages,
    totalWords: totalWordCount,
    coverUrl,
    dateAdded: Date.now(),
    lastReadTimestamp: Date.now(),
    currentPage: 1,
    scrollProgress: 0,
    isSample: false,
  };

  const content: ParsedBookContent = {
    id: bookId,
    pages: parsedPages,
    toc: finalToc,
  };

  if (onProgress) {
    onProgress({
      currentPage: totalPages,
      totalPages,
      percent: 100,
      stage: 'Concluído!',
    });
  }

  return { book, content };
}

/**
 * Intelligent line sorting and paragraph reconstructor
 */
function processPageItems(
  items: RawTextItem[],
  pageNum: number,
  pageHeight: number
): {
  blocks: ParagraphBlock[];
  rawText: string;
  wordCount: number;
  headings: TocItem[];
} {
  if (items.length === 0) {
    return {
      blocks: [
        {
          id: `p_${pageNum}_empty`,
          type: 'p',
          text: '(Página sem texto reconhecido ou composta apenas por imagem.)',
          pageNumber: pageNum,
        },
      ],
      rawText: '',
      wordCount: 0,
      headings: [],
    };
  }

  // Calculate median font height to distinguish headings from body text
  const heights = items.map((i) => i.height).filter((h) => h > 4);
  heights.sort((a, b) => a - b);
  const medianHeight = heights[Math.floor(heights.length / 2)] || 12;

  // Group items into horizontal lines (items with nearly equal Y)
  // PDF Y is measured from bottom up: larger Y = higher on page
  // Sort descending by Y first
  items.sort((a, b) => {
    const diffY = b.y - a.y;
    if (Math.abs(diffY) > 3) {
      return diffY;
    }
    return a.x - b.x; // same line: sort left to right
  });

  interface LineItem {
    y: number;
    text: string;
    avgHeight: number;
    isTopMargin: boolean;
    isBottomMargin: boolean;
  }

  const lines: LineItem[] = [];
  let currentLineItems: RawTextItem[] = [];
  let currentLineY = items[0]?.y ?? 0;

  for (const item of items) {
    if (Math.abs(item.y - currentLineY) <= 3.5) {
      currentLineItems.push(item);
    } else {
      // Flush current line
      if (currentLineItems.length > 0) {
        currentLineItems.sort((a, b) => a.x - b.x);
        const lineText = currentLineItems
          .map((i) => i.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        const avgH =
          currentLineItems.reduce((acc, i) => acc + i.height, 0) / currentLineItems.length;

        if (lineText) {
          lines.push({
            y: currentLineY,
            text: lineText,
            avgHeight: avgH,
            isTopMargin: currentLineY > pageHeight * 0.94,
            isBottomMargin: currentLineY < pageHeight * 0.06,
          });
        }
      }
      currentLineItems = [item];
      currentLineY = item.y;
    }
  }

  if (currentLineItems.length > 0) {
    currentLineItems.sort((a, b) => a.x - b.x);
    const lineText = currentLineItems
      .map((i) => i.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const avgH =
      currentLineItems.reduce((acc, i) => acc + i.height, 0) / currentLineItems.length;
    if (lineText) {
      lines.push({
        y: currentLineY,
        text: lineText,
        avgHeight: avgH,
        isTopMargin: currentLineY > pageHeight * 0.94,
        isBottomMargin: currentLineY < pageHeight * 0.06,
      });
    }
  }

  // Filter out running page numbers and header noise
  const filteredLines = lines.filter((l) => {
    // If it's pure number at top or bottom margin, it's just a page number
    if ((l.isTopMargin || l.isBottomMargin) && /^\d+$/.test(l.text.trim())) {
      return false;
    }
    // Filter very short repeated footer/header tags
    if (l.isBottomMargin && l.text.length < 5 && /^[ivxlcdm\d\s.-]+$/i.test(l.text)) {
      return false;
    }
    return true;
  });

  // Reconstruct paragraphs and headings
  const blocks: ParagraphBlock[] = [];
  const headings: TocItem[] = [];

  let currentParaText = '';
  let currentParaType: 'p' | 'h1' | 'h2' | 'h3' | 'quote' = 'p';
  let blockIndex = 0;

  function flushParagraph() {
    if (!currentParaText.trim()) return;
    const cleanText = currentParaText
      .replace(/\s+/g, ' ')
      .replace(/([a-zA-Zá-úÁ-Ú])- ([a-zA-Zá-úÁ-Ú])/g, '$1$2') // De-hyphenate broken words
      .trim();

    if (cleanText) {
      blocks.push({
        id: `blk_${pageNum}_${blockIndex++}`,
        type: currentParaType,
        text: cleanText,
        pageNumber: pageNum,
      });
    }
    currentParaText = '';
    currentParaType = 'p';
  }

  for (let i = 0; i < filteredLines.length; i++) {
    const line = filteredLines[i];
    const prevLine = i > 0 ? filteredLines[i - 1] : null;

    const isLargeFont = line.avgHeight >= medianHeight * 1.32;
    const isVeryLarge = line.avgHeight >= medianHeight * 1.6;
    const isChapterLabel =
      /^(cap[ií]tulo|parte|se[çc][ãa]o|chapter|section|livro|pr[oó]logo|ep[ií]logo)\b/i.test(
        line.text.trim()
      );

    const isHeading =
      (isLargeFont || isChapterLabel) &&
      line.text.length < 90 &&
      !line.text.endsWith('.') &&
      !line.text.endsWith(',');

    if (isHeading) {
      flushParagraph();
      const level = isVeryLarge || isChapterLabel ? 1 : 2;
      const hType: 'h1' | 'h2' = level === 1 ? 'h1' : 'h2';

      blocks.push({
        id: `blk_${pageNum}_${blockIndex++}`,
        type: hType,
        text: line.text.trim(),
        pageNumber: pageNum,
      });

      headings.push({
        title: line.text.trim(),
        pageNumber: pageNum,
        level,
      });
      continue;
    }

    // Check vertical gap between consecutive lines
    const lineGap = prevLine ? prevLine.y - line.y : 0;
    const isBigGap = lineGap > line.avgHeight * 2.2;

    // Check if previous line ended a sentence
    const endsWithTerminal =
      currentParaText.endsWith('.') ||
      currentParaText.endsWith('!') ||
      currentParaText.endsWith('?') ||
      currentParaText.endsWith(':') ||
      currentParaText.endsWith('”') ||
      currentParaText.endsWith('"');

    // Hyphen at end of line (e.g., "res-", "para-")
    const endsWithHyphen = currentParaText.endsWith('-') || currentParaText.endsWith('—');

    if (currentParaText && (isBigGap || (endsWithTerminal && (isLargeFont || /^[A-ZÁ-Ú0-9]/.test(line.text))))) {
      flushParagraph();
    }

    if (endsWithHyphen) {
      // remove trailing hyphen and join seamlessly
      currentParaText = currentParaText.slice(0, -1) + line.text;
    } else if (currentParaText) {
      currentParaText += ' ' + line.text;
    } else {
      currentParaText = line.text;
    }
  }

  flushParagraph();

  // Combine full raw text for search and word count
  const rawText = blocks.map((b) => b.text).join('\n\n');
  const wordCount = rawText
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return { blocks, rawText, wordCount, headings };
}
