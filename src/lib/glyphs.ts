import type { GlyphDefinition } from '@/types';

// ─── English Glyphs ───────────────────────────────────────────────

export const ENGLISH_UPPERCASE: GlyphDefinition[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => ({
  character: c,
  unicode: c.charCodeAt(0),
  type: 'uppercase' as const,
  label: c,
  group: 'Uppercase',
}));

export const ENGLISH_LOWERCASE: GlyphDefinition[] = 'abcdefghijklmnopqrstuvwxyz'.split('').map((c) => ({
  character: c,
  unicode: c.charCodeAt(0),
  type: 'lowercase' as const,
  label: c,
  group: 'Lowercase',
}));

export const NUMBERS: GlyphDefinition[] = '0123456789'.split('').map((c) => ({
  character: c,
  unicode: c.charCodeAt(0),
  type: 'number' as const,
  label: c,
  group: 'Numbers',
}));

export const SYMBOLS: GlyphDefinition[] = [
  '.', ',', '!', '?', "'", '"', ':', ';', '-', '_', '(', ')', '&', '@', '#',
].map((c) => ({
  character: c,
  unicode: c.charCodeAt(0),
  type: 'symbol' as const,
  label: c,
  group: 'Symbols',
}));

// ─── Korean Jamo ──────────────────────────────────────────────────

export const KOREAN_INITIALS: GlyphDefinition[] = [
  { char: 'ㄱ', label: '기역' },
  { char: 'ㄴ', label: '니은' },
  { char: 'ㄷ', label: '디귿' },
  { char: 'ㄹ', label: '리을' },
  { char: 'ㅁ', label: '미음' },
  { char: 'ㅂ', label: '비읍' },
  { char: 'ㅅ', label: '시옷' },
  { char: 'ㅇ', label: '이응' },
  { char: 'ㅈ', label: '지읒' },
  { char: 'ㅊ', label: '치읓' },
  { char: 'ㅋ', label: '키읔' },
  { char: 'ㅌ', label: '티읕' },
  { char: 'ㅍ', label: '피읖' },
  { char: 'ㅎ', label: '히읗' },
  { char: 'ㄲ', label: '쌍기역' },
  { char: 'ㄸ', label: '쌍디귿' },
  { char: 'ㅃ', label: '쌍비읍' },
  { char: 'ㅆ', label: '쌍시옷' },
  { char: 'ㅉ', label: '쌍지읒' },
].map(({ char, label }) => ({
  character: char,
  unicode: char.charCodeAt(0),
  type: 'jamo-initial' as const,
  label,
  group: '초성',
}));

export const KOREAN_VOWELS: GlyphDefinition[] = [
  { char: 'ㅏ', label: '아' },
  { char: 'ㅐ', label: '애' },
  { char: 'ㅑ', label: '야' },
  { char: 'ㅒ', label: '얘' },
  { char: 'ㅓ', label: '어' },
  { char: 'ㅔ', label: '에' },
  { char: 'ㅕ', label: '여' },
  { char: 'ㅖ', label: '예' },
  { char: 'ㅗ', label: '오' },
  { char: 'ㅘ', label: '와' },
  { char: 'ㅙ', label: '왜' },
  { char: 'ㅚ', label: '외' },
  { char: 'ㅛ', label: '요' },
  { char: 'ㅜ', label: '우' },
  { char: 'ㅝ', label: '워' },
  { char: 'ㅞ', label: '웨' },
  { char: 'ㅟ', label: '위' },
  { char: 'ㅠ', label: '유' },
  { char: 'ㅡ', label: '으' },
  { char: 'ㅢ', label: '의' },
  { char: 'ㅣ', label: '이' },
].map(({ char, label }) => ({
  character: char,
  unicode: char.charCodeAt(0),
  type: 'jamo-vowel' as const,
  label,
  group: '중성',
}));

export const KOREAN_FINALS: GlyphDefinition[] = [
  { char: 'ㄱ', label: '기역' },
  { char: 'ㄲ', label: '쌍기역' },
  { char: 'ㄳ', label: '기역시옷' },
  { char: 'ㄴ', label: '니은' },
  { char: 'ㄵ', label: '니은지읒' },
  { char: 'ㄶ', label: '니은히읗' },
  { char: 'ㄷ', label: '디귿' },
  { char: 'ㄹ', label: '리을' },
  { char: 'ㄺ', label: '리을기역' },
  { char: 'ㄻ', label: '리을미음' },
  { char: 'ㄼ', label: '리을비읍' },
  { char: 'ㄽ', label: '리을시옷' },
  { char: 'ㄾ', label: '리을티읕' },
  { char: 'ㄿ', label: '리을피읖' },
  { char: 'ㅀ', label: '리을히읗' },
  { char: 'ㅁ', label: '미음' },
  { char: 'ㅂ', label: '비읍' },
  { char: 'ㅄ', label: '비읍시옷' },
  { char: 'ㅅ', label: '시옷' },
  { char: 'ㅆ', label: '쌍시옷' },
  { char: 'ㅇ', label: '이응' },
  { char: 'ㅈ', label: '지읒' },
  { char: 'ㅊ', label: '치읓' },
  { char: 'ㅋ', label: '키읔' },
  { char: 'ㅌ', label: '티읕' },
  { char: 'ㅍ', label: '피읖' },
  { char: 'ㅎ', label: '히읗' },
].map(({ char, label }) => ({
  character: char,
  unicode: char.charCodeAt(0),
  type: 'jamo-final' as const,
  label,
  group: '종성',
}));

// ─── Japanese ─────────────────────────────────────────────────────

export const HIRAGANA: GlyphDefinition[] = [
  { char: 'あ', label: 'a'   }, { char: 'い', label: 'i'   }, { char: 'う', label: 'u'  },
  { char: 'え', label: 'e'   }, { char: 'お', label: 'o'   },
  { char: 'か', label: 'ka'  }, { char: 'き', label: 'ki'  }, { char: 'く', label: 'ku' },
  { char: 'け', label: 'ke'  }, { char: 'こ', label: 'ko'  },
  { char: 'さ', label: 'sa'  }, { char: 'し', label: 'shi' }, { char: 'す', label: 'su' },
  { char: 'せ', label: 'se'  }, { char: 'そ', label: 'so'  },
  { char: 'た', label: 'ta'  }, { char: 'ち', label: 'chi' }, { char: 'つ', label: 'tsu'},
  { char: 'て', label: 'te'  }, { char: 'と', label: 'to'  },
  { char: 'な', label: 'na'  }, { char: 'に', label: 'ni'  }, { char: 'ぬ', label: 'nu' },
  { char: 'ね', label: 'ne'  }, { char: 'の', label: 'no'  },
  { char: 'は', label: 'ha'  }, { char: 'ひ', label: 'hi'  }, { char: 'ふ', label: 'fu' },
  { char: 'へ', label: 'he'  }, { char: 'ほ', label: 'ho'  },
  { char: 'ま', label: 'ma'  }, { char: 'み', label: 'mi'  }, { char: 'む', label: 'mu' },
  { char: 'め', label: 'me'  }, { char: 'も', label: 'mo'  },
  { char: 'や', label: 'ya'  }, { char: 'ゆ', label: 'yu'  }, { char: 'よ', label: 'yo' },
  { char: 'ら', label: 'ra'  }, { char: 'り', label: 'ri'  }, { char: 'る', label: 'ru' },
  { char: 'れ', label: 're'  }, { char: 'ろ', label: 'ro'  },
  { char: 'わ', label: 'wa'  }, { char: 'を', label: 'wo'  }, { char: 'ん', label: 'n'  },
].map(({ char, label }) => ({
  character: char,
  unicode: char.charCodeAt(0),
  type: 'hiragana' as const,
  label,
  group: 'ひらがな',
}));

export const KATAKANA: GlyphDefinition[] = [
  { char: 'ア', label: 'a'   }, { char: 'イ', label: 'i'   }, { char: 'ウ', label: 'u'  },
  { char: 'エ', label: 'e'   }, { char: 'オ', label: 'o'   },
  { char: 'カ', label: 'ka'  }, { char: 'キ', label: 'ki'  }, { char: 'ク', label: 'ku' },
  { char: 'ケ', label: 'ke'  }, { char: 'コ', label: 'ko'  },
  { char: 'サ', label: 'sa'  }, { char: 'シ', label: 'shi' }, { char: 'ス', label: 'su' },
  { char: 'セ', label: 'se'  }, { char: 'ソ', label: 'so'  },
  { char: 'タ', label: 'ta'  }, { char: 'チ', label: 'chi' }, { char: 'ツ', label: 'tsu'},
  { char: 'テ', label: 'te'  }, { char: 'ト', label: 'to'  },
  { char: 'ナ', label: 'na'  }, { char: 'ニ', label: 'ni'  }, { char: 'ヌ', label: 'nu' },
  { char: 'ネ', label: 'ne'  }, { char: 'ノ', label: 'no'  },
  { char: 'ハ', label: 'ha'  }, { char: 'ヒ', label: 'hi'  }, { char: 'フ', label: 'fu' },
  { char: 'ヘ', label: 'he'  }, { char: 'ホ', label: 'ho'  },
  { char: 'マ', label: 'ma'  }, { char: 'ミ', label: 'mi'  }, { char: 'ム', label: 'mu' },
  { char: 'メ', label: 'me'  }, { char: 'モ', label: 'mo'  },
  { char: 'ヤ', label: 'ya'  }, { char: 'ユ', label: 'yu'  }, { char: 'ヨ', label: 'yo' },
  { char: 'ラ', label: 'ra'  }, { char: 'リ', label: 'ri'  }, { char: 'ル', label: 'ru' },
  { char: 'レ', label: 're'  }, { char: 'ロ', label: 'ro'  },
  { char: 'ワ', label: 'wa'  }, { char: 'ヲ', label: 'wo'  }, { char: 'ン', label: 'n'  },
].map(({ char, label }) => ({
  character: char,
  unicode: char.charCodeAt(0),
  type: 'katakana' as const,
  label,
  group: 'カタカナ',
}));

export const JAPANESE_GLYPHS: GlyphDefinition[] = [
  ...HIRAGANA,
  ...KATAKANA,
];

// ─── Glyph Sets ───────────────────────────────────────────────────

export const ENGLISH_GLYPHS: GlyphDefinition[] = [
  ...ENGLISH_UPPERCASE,
  ...ENGLISH_LOWERCASE,
  ...NUMBERS,
  ...SYMBOLS,
];

export const KOREAN_GLYPHS: GlyphDefinition[] = [
  ...KOREAN_INITIALS,
  ...KOREAN_VOWELS,
  ...KOREAN_FINALS,
];

export const MIXED_GLYPHS: GlyphDefinition[] = [
  ...ENGLISH_GLYPHS,
  ...KOREAN_GLYPHS,
];

export function getGlyphsForLanguage(language: 'en' | 'ko' | 'mixed' | 'ja'): GlyphDefinition[] {
  switch (language) {
    case 'en': return ENGLISH_GLYPHS;
    case 'ko': return KOREAN_GLYPHS;
    case 'mixed': return MIXED_GLYPHS;
    case 'ja': return JAPANESE_GLYPHS;
  }
}
