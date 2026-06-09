// ─── Core Drawing Types ───────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  width: number;
  color?: string;
}

// ─── Glyph Types ──────────────────────────────────────────────────

export type GlyphType = 'uppercase' | 'lowercase' | 'number' | 'symbol' | 'jamo-initial' | 'jamo-vowel' | 'jamo-final' | 'hiragana' | 'katakana';

export interface Glyph {
  id: string;
  character: string;
  unicode: number;
  type: GlyphType;
  strokes: Stroke[];
  svgPath?: string;
  normalizedPath?: string;
  boundingBox?: BoundingBox;
  isComplete: boolean;
  drawnAt?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Font Types ───────────────────────────────────────────────────

export type FontLanguage = 'en' | 'ko' | 'mixed' | 'ja';

export interface FontMetadata {
  unitsPerEm: number;
  ascender: number;
  descender: number;
  capHeight: number;
  xHeight: number;
}

export interface UserFont {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  language: FontLanguage;
  glyphs: Glyph[];
  metadata: FontMetadata;
  ttfBuffer?: ArrayBuffer;
}

// ─── Glyph Collection Types ───────────────────────────────────────

export interface GlyphSet {
  language: FontLanguage;
  required: GlyphDefinition[];
  optional: GlyphDefinition[];
}

export interface GlyphDefinition {
  character: string;
  unicode: number;
  type: GlyphType;
  label: string;
  group: string;
}

// ─── Card Types ───────────────────────────────────────────────────

export type CardTemplate = 'postit' | 'notebook' | 'letter' | 'polaroid' | 'simple';
export type PostitColor = 'yellow' | 'pink' | 'blue' | 'white' | 'cream';
export type ContentMode = 'preset' | 'memory' | 'thought';

export interface CardConfig {
  id: string;
  template: CardTemplate;
  color: PostitColor;
  text: string;
  contentMode: ContentMode;
  fontSize: number;
  lineHeight: number;
  padding: number;
  fontId: string;
}

export interface CardExportOptions {
  width: number;
  height: number;
  scale: number;
  format: 'png' | 'jpeg';
  quality?: number;
}

// ─── Drawing Session ──────────────────────────────────────────────

export interface DrawingSession {
  id: string;
  fontId: string;
  currentGlyphIndex: number;
  glyphOrder: string[];
  savedAt: string;
}

// ─── Canvas State ─────────────────────────────────────────────────

export interface CanvasConfig {
  width: number;
  height: number;
  strokeWidth: number;
  strokeColor: string;
  showGuides: boolean;
  showGhostChar: boolean;
}

// ─── Export Types ─────────────────────────────────────────────────

export type ExportFormat = 'ttf' | 'png' | 'svg';

export interface ExportResult {
  format: ExportFormat;
  blob: Blob;
  url: string;
  filename: string;
}
