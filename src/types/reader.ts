export type ThemeMode = 'light' | 'sepia' | 'dark' | 'amoled' | 'solarized';
export type FontFamilyKey = 'literata' | 'merriweather' | 'inter' | 'atkinson' | 'jetbrains';
export type ReadingMode = 'continuous' | 'paginated' | 'original';
export type ColumnWidth = 'narrow' | 'medium' | 'wide' | 'full';

export interface ParagraphBlock {
  id: string;
  type: 'h1' | 'h2' | 'h3' | 'p' | 'quote' | 'list-item';
  text: string;
  pageNumber: number;
}

export interface ParsedPage {
  pageNumber: number;
  blocks: ParagraphBlock[];
  rawText: string;
  wordCount: number;
}

export interface TocItem {
  title: string;
  pageNumber: number;
  level: number;
}

export interface ParsedBookContent {
  id: string;
  pages: ParsedPage[];
  toc: TocItem[];
}

export interface Bookmark {
  id: string;
  bookId: string;
  pageNumber: number;
  snippet: string;
  note?: string;
  createdAt: number;
}

export interface Highlight {
  id: string;
  bookId: string;
  pageNumber: number;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  note?: string;
  createdAt: number;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  totalPages: number;
  totalWords: number;
  coverUrl?: string;
  dateAdded: number;
  lastReadTimestamp: number;
  currentPage: number;
  scrollProgress: number; // 0 to 100
  isSample?: boolean;
}

export interface ReadingSettings {
  fontSize: number; // 14 to 34
  theme: ThemeMode;
  fontFamily: FontFamilyKey;
  lineHeight: number; // 1.4 to 2.2
  letterSpacing: number; // -0.5 to 1.5
  textAlign: 'left' | 'justify';
  columnWidth: ColumnWidth;
  bionicReading: boolean;
  brightness: number; // 30 to 100
  readingMode: ReadingMode;
  showPageDividers: boolean;
  readingSpeedWpm: number; // estimated reading speed for time left
}

export const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 18,
  theme: 'dark',
  fontFamily: 'literata',
  lineHeight: 1.7,
  letterSpacing: 0,
  textAlign: 'left',
  columnWidth: 'medium',
  bionicReading: false,
  brightness: 100,
  readingMode: 'continuous',
  showPageDividers: true,
  readingSpeedWpm: 220,
};

export interface ThemeConfig {
  name: string;
  id: ThemeMode;
  bg: string;
  text: string;
  subtext: string;
  uiBg: string;
  uiBorder: string;
  accent: string;
  cardBg: string;
  highlightYellow: string;
  highlightGreen: string;
  highlightBlue: string;
}

export const THEMES: Record<ThemeMode, ThemeConfig> = {
  dark: {
    name: 'Noturno Suave',
    id: 'dark',
    bg: '#141824',
    text: '#E2E8F0',
    subtext: '#94A3B8',
    uiBg: '#1E293B',
    uiBorder: '#334155',
    accent: '#38BDF8',
    cardBg: '#1E2433',
    highlightYellow: 'rgba(250, 204, 21, 0.3)',
    highlightGreen: 'rgba(74, 222, 128, 0.3)',
    highlightBlue: 'rgba(96, 165, 250, 0.3)',
  },
  amoled: {
    name: 'Preto Puro (AMOLED)',
    id: 'amoled',
    bg: '#000000',
    text: '#D1D5DB',
    subtext: '#6B7280',
    uiBg: '#111111',
    uiBorder: '#27272A',
    accent: '#60A5FA',
    cardBg: '#0F0F10',
    highlightYellow: 'rgba(250, 204, 21, 0.35)',
    highlightGreen: 'rgba(74, 222, 128, 0.35)',
    highlightBlue: 'rgba(96, 165, 250, 0.35)',
  },
  sepia: {
    name: 'Sépia Livro',
    id: 'sepia',
    bg: '#F5EEDB',
    text: '#382D22',
    subtext: '#7C6C58',
    uiBg: '#EBDDC3',
    uiBorder: '#D8C7A5',
    accent: '#A36829',
    cardBg: '#EFE5CE',
    highlightYellow: 'rgba(251, 191, 36, 0.45)',
    highlightGreen: 'rgba(52, 211, 153, 0.45)',
    highlightBlue: 'rgba(96, 165, 250, 0.45)',
  },
  solarized: {
    name: 'Âmbar Quente',
    id: 'solarized',
    bg: '#1C1917',
    text: '#F5E8D8',
    subtext: '#A89984',
    uiBg: '#292524',
    uiBorder: '#44403C',
    accent: '#F97316',
    cardBg: '#23201D',
    highlightYellow: 'rgba(245, 158, 11, 0.35)',
    highlightGreen: 'rgba(34, 197, 94, 0.35)',
    highlightBlue: 'rgba(59, 130, 246, 0.35)',
  },
  light: {
    name: 'Claro Puro',
    id: 'light',
    bg: '#FAFAF9',
    text: '#1C1917',
    subtext: '#71717A',
    uiBg: '#FFFFFF',
    uiBorder: '#E4E4E7',
    accent: '#2563EB',
    cardBg: '#FFFFFF',
    highlightYellow: 'rgba(254, 240, 138, 0.75)',
    highlightGreen: 'rgba(187, 247, 208, 0.75)',
    highlightBlue: 'rgba(191, 219, 254, 0.75)',
  },
};

export const FONT_CONFIGS: Record<FontFamilyKey, { name: string; css: string; description: string }> = {
  literata: {
    name: 'Literata',
    css: "'Literata', Georgia, serif",
    description: 'Serifada elegante concebida para livros digitais',
  },
  merriweather: {
    name: 'Merriweather',
    css: "'Merriweather', serif",
    description: 'Serifada clássica encorpada para telas',
  },
  inter: {
    name: 'Inter Sans',
    css: "'Inter', system-ui, sans-serif",
    description: 'Moderna, limpa e nítida para alta legibilidade',
  },
  atkinson: {
    name: 'Atkinson Hyperlegible',
    css: "'Atkinson Hyperlegible', sans-serif",
    description: 'Otimizada para máxima distinção de caracteres e dislexia',
  },
  jetbrains: {
    name: 'JetBrains Mono',
    css: "'JetBrains Mono', monospace",
    description: 'Espaçamento fixo ideal para textos técnicos e código',
  },
};
