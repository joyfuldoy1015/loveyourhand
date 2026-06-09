import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { UserFont, Glyph, FontLanguage } from '@/types';
import { fontRepo } from '@/lib/db';
import { getGlyphsForLanguage } from '@/lib/glyphs';

interface FontState {
  currentFont: UserFont | null;
  savedFonts: UserFont[];
  isLoading: boolean;
  isSaving: boolean;
}

interface FontActions {
  createFont: (language: FontLanguage, name?: string) => UserFont;
  loadFont: (id: string) => Promise<void>;
  loadAllFonts: () => Promise<void>;
  saveCurrentFont: () => Promise<void>;
  deleteFont: (id: string) => Promise<void>;
  updateGlyph: (glyph: Glyph) => void;
  setCurrentFont: (font: UserFont | null) => void;
}

const DEFAULT_METADATA = {
  unitsPerEm: 1000,
  ascender: 800,
  descender: -200,
  capHeight: 700,
  xHeight: 500,
};

export const useFontStore = create<FontState & FontActions>()(
  immer((set, get) => ({
    currentFont: null,
    savedFonts: [],
    isLoading: false,
    isSaving: false,

    createFont(language, name) {
      const glyphDefs = getGlyphsForLanguage(language);
      const glyphs: Glyph[] = glyphDefs.map((def) => ({
        id: nanoid(),
        character: def.character,
        unicode: def.unicode,
        type: def.type,
        strokes: [],
        isComplete: false,
      }));

      const font: UserFont = {
        id: nanoid(),
        name: name ?? `My Font ${new Date().toLocaleDateString('ko-KR')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        language,
        glyphs,
        metadata: DEFAULT_METADATA,
      };

      set((state) => { state.currentFont = font; });
      return font;
    },

    async loadFont(id) {
      set((state) => { state.isLoading = true; });
      try {
        const font = await fontRepo.getById(id);
        set((state) => {
          state.currentFont = font ?? null;
          state.isLoading = false;
        });
      } catch {
        set((state) => { state.isLoading = false; });
      }
    },

    async loadAllFonts() {
      set((state) => { state.isLoading = true; });
      try {
        const fonts = await fontRepo.getAll();
        set((state) => {
          state.savedFonts = fonts;
          state.isLoading = false;
        });
      } catch {
        set((state) => { state.isLoading = false; });
      }
    },

    async saveCurrentFont() {
      const { currentFont } = get();
      if (!currentFont) return;

      set((state) => { state.isSaving = true; });
      try {
        const updated = { ...currentFont, updatedAt: new Date().toISOString() };
        await fontRepo.save(updated);
        set((state) => {
          state.currentFont = updated;
          state.isSaving = false;
        });
      } catch {
        set((state) => { state.isSaving = false; });
      }
    },

    async deleteFont(id) {
      await fontRepo.delete(id);
      set((state) => {
        state.savedFonts = state.savedFonts.filter((f) => f.id !== id);
        if (state.currentFont?.id === id) state.currentFont = null;
      });
    },

    updateGlyph(glyph) {
      set((state) => {
        if (!state.currentFont) return;
        const idx = state.currentFont.glyphs.findIndex((g) => g.id === glyph.id);
        if (idx !== -1) state.currentFont.glyphs[idx] = glyph;
        state.currentFont.updatedAt = new Date().toISOString();
      });
    },

    setCurrentFont(font) {
      set((state) => { state.currentFont = font; });
    },
  }))
);
