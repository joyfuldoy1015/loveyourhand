/**
 * Korean Hangul Composer
 *
 * Architecture for P0/P1/P2 Hangul support:
 *
 *   P0 (current): Font stores individual jamo as standalone glyphs.
 *                 Card renderer renders each jamo separately.
 *
 *   P1 (future):  Compose syllable blocks from drawn jamo at render time
 *                 using the standard SIndex formula. Font output includes
 *                 both jamo and precomposed syllable glyphs.
 *
 *   P2 (future):  Full Hangul automation — detect syllable block boundaries,
 *                 auto-compose from user-drawn jamo, support all 11,172
 *                 syllable blocks.
 *
 * Unicode reference:
 *   Hangul Compatibility Jamo: U+3131–U+318E (used in P0 font glyphs)
 *   Hangul Jamo (combining):   U+1100–U+11FF
 *   Hangul Syllables:          U+AC00–U+D7A3
 *
 * Syllable formula (P1+):
 *   SIndex = (choseong × 21 + jungseong) × 28 + jongseong
 *   Syllable = 0xAC00 + SIndex
 */

// ─── Jamo tables ──────────────────────────────────────────────────

/** 초성 (initial consonants) — 19 glyphs, Hangul Jamo U+1100–U+1112 */
export const CHOSEONG: readonly string[] = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
  'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

/** 중성 (vowels) — 21 glyphs, Hangul Jamo U+1161–U+1175 */
export const JUNGSEONG: readonly string[] = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
];

/** 종성 (final consonants) — 27 glyphs (index 0 = no final)
 *  The 28-slot table includes an empty slot at index 0. */
export const JONGSEONG: readonly string[] = [
  // index 0 = absent (no final consonant)
  'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ',
  'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ',
  'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

// Compatibility Jamo codepoints for our drawn glyph set (P0)
export const COMPAT_CONSONANTS: readonly number[] = [
  0x3131, 0x3132, 0x3133, 0x3134, 0x3135, 0x3136, 0x3137, 0x3138, 0x3139,
  0x313A, 0x313B, 0x313C, 0x313D, 0x313E, 0x313F, 0x3140, 0x3141, 0x3142,
  0x3143, 0x3144, 0x3145, 0x3146, 0x3147, 0x3148, 0x3149, 0x314A, 0x314B,
  0x314C, 0x314D, 0x314E,
];

export const COMPAT_VOWELS: readonly number[] = [
  0x314F, 0x3150, 0x3151, 0x3152, 0x3153, 0x3154, 0x3155, 0x3156, 0x3157,
  0x3158, 0x3159, 0x315A, 0x315B, 0x315C, 0x315D, 0x315E, 0x315F, 0x3160,
  0x3161, 0x3162, 0x3163,
];

// ─── Syllable composition (P1+) ───────────────────────────────────

export interface SyllableBlock {
  choseong:  number; // index into CHOSEONG (0-18)
  jungseong: number; // index into JUNGSEONG (0-20)
  jongseong: number; // index into JONGSEONG (0-26); 0 = no final
}

/**
 * Compose a Unicode syllable codepoint from jamo indices.
 * Standard SIndex formula from Unicode 14 §3.12.
 */
export function composeSyllable(block: SyllableBlock): number {
  const { choseong: cho, jungseong: jung, jongseong: jong } = block;
  return 0xAC00 + (cho * 21 + jung) * 28 + jong;
}

/**
 * Decompose a precomposed Hangul syllable into jamo indices.
 * Returns null if `codepoint` is not in the Hangul Syllables block.
 */
export function decomposeSyllable(codepoint: number): SyllableBlock | null {
  if (codepoint < 0xAC00 || codepoint > 0xD7A3) return null;
  const offset  = codepoint - 0xAC00;
  const jong    = offset % 28;
  const choJung = Math.floor(offset / 28);
  const jung    = choJung % 21;
  const cho     = Math.floor(choJung / 21);
  return { choseong: cho, jungseong: jung, jongseong: jong };
}

// ─── Text decomposition for card rendering (P0) ──────────────────

export interface JamoSequence {
  character: string;  // display character
  unicode:   number;  // Unicode codepoint to look up in font
  isKorean:  boolean;
}

/**
 * Decompose a text string into a sequence of renderable units.
 *
 * P0 behaviour: precomposed syllables are decomposed to their jamo
 * so that our drawn jamo glyphs can be used for rendering.
 *
 * P1+ behaviour (future): compose drawn jamo into syllable glyphs
 * and render at the syllable block level for correct spacing.
 */
export function decomposeForRendering(text: string): JamoSequence[] {
  const result: JamoSequence[] = [];
  for (const char of text) {
    const cp = char.codePointAt(0)!;
    if (cp >= 0xAC00 && cp <= 0xD7A3) {
      // Precomposed syllable → decompose to compatibility jamo
      const block = decomposeSyllable(cp)!;
      const jamoList = syllableToCompatJamo(block);
      for (const { char: j, unicode } of jamoList) {
        result.push({ character: j, unicode, isKorean: true });
      }
    } else {
      result.push({ character: char, unicode: cp, isKorean: isKoreanCodepoint(cp) });
    }
  }
  return result;
}

/** Map a SyllableBlock to compatibility jamo characters for font lookup. */
function syllableToCompatJamo(block: SyllableBlock): Array<{ char: string; unicode: number }> {
  const items: Array<{ char: string; unicode: number }> = [];

  // Choseong → compatibility consonant
  const choChar = CHOSEONG[block.choseong];
  if (choChar) {
    const cp = compatConsonantOf(choChar);
    if (cp) items.push({ char: choChar, unicode: cp });
  }

  // Jungseong → compatibility vowel
  const jungChar = JUNGSEONG[block.jungseong];
  if (jungChar) {
    const cp = compatVowelOf(jungChar);
    if (cp) items.push({ char: jungChar, unicode: cp });
  }

  // Jongseong (if present)
  if (block.jongseong > 0) {
    const jongChar = JONGSEONG[block.jongseong - 1];
    if (jongChar) {
      const cp = compatConsonantOf(jongChar);
      if (cp) items.push({ char: jongChar, unicode: cp });
    }
  }

  return items;
}

// ─── Compat codepoint lookup ──────────────────────────────────────

const CONSONANT_TO_COMPAT: Record<string, number> = {
  'ㄱ': 0x3131, 'ㄲ': 0x3132, 'ㄳ': 0x3133, 'ㄴ': 0x3134, 'ㄵ': 0x3135,
  'ㄶ': 0x3136, 'ㄷ': 0x3137, 'ㄸ': 0x3138, 'ㄹ': 0x3139, 'ㄺ': 0x313A,
  'ㄻ': 0x313B, 'ㄼ': 0x313C, 'ㄽ': 0x313D, 'ㄾ': 0x313E, 'ㄿ': 0x313F,
  'ㅀ': 0x3140, 'ㅁ': 0x3141, 'ㅂ': 0x3142, 'ㅃ': 0x3143, 'ㅄ': 0x3144,
  'ㅅ': 0x3145, 'ㅆ': 0x3146, 'ㅇ': 0x3147, 'ㅈ': 0x3148, 'ㅉ': 0x3149,
  'ㅊ': 0x314A, 'ㅋ': 0x314B, 'ㅌ': 0x314C, 'ㅍ': 0x314D, 'ㅎ': 0x314E,
};

const VOWEL_TO_COMPAT: Record<string, number> = {
  'ㅏ': 0x314F, 'ㅐ': 0x3150, 'ㅑ': 0x3151, 'ㅒ': 0x3152, 'ㅓ': 0x3153,
  'ㅔ': 0x3154, 'ㅕ': 0x3155, 'ㅖ': 0x3156, 'ㅗ': 0x3157, 'ㅘ': 0x3158,
  'ㅙ': 0x3159, 'ㅚ': 0x315A, 'ㅛ': 0x315B, 'ㅜ': 0x315C, 'ㅝ': 0x315D,
  'ㅞ': 0x315E, 'ㅟ': 0x315F, 'ㅠ': 0x3160, 'ㅡ': 0x3161, 'ㅢ': 0x3162, 'ㅣ': 0x3163,
};

export function compatConsonantOf(char: string): number | undefined {
  return CONSONANT_TO_COMPAT[char];
}

export function compatVowelOf(char: string): number | undefined {
  return VOWEL_TO_COMPAT[char];
}

export function isKoreanCodepoint(cp: number): boolean {
  return (cp >= 0xAC00 && cp <= 0xD7A3) ||  // syllables
         (cp >= 0x1100 && cp <= 0x11FF) ||   // jamo
         (cp >= 0x3131 && cp <= 0x318E);     // compat jamo
}
