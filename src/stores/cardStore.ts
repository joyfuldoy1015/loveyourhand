import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { CardConfig, CardTemplate, PostitColor, ContentMode } from '@/types';
import { cardRepo } from '@/lib/db';

const PRESET_QUOTES = [
  'Handmade in a machine-made world.',
  'Love your hand.',
  'Some things are better imperfect.',
  'Your handwriting deserves a place in the digital world.',
  'Turn your handwriting into something worth keeping.',
] as const;

interface CardState {
  currentCard: CardConfig | null;
  savedCards: CardConfig[];
  presetQuotes: readonly string[];
  isExporting: boolean;
}

interface CardActions {
  createCard: (fontId: string) => CardConfig;
  updateCard: (updates: Partial<CardConfig>) => void;
  saveCard: () => Promise<void>;
  loadCards: (fontId: string) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  setTemplate: (template: CardTemplate) => void;
  setColor: (color: PostitColor) => void;
  setText: (text: string) => void;
  setMode: (mode: ContentMode) => void;
  setIsExporting: (v: boolean) => void;
}

const DEFAULT_CARD: Omit<CardConfig, 'id' | 'fontId'> = {
  template: 'postit',
  color: 'yellow',
  text: 'Handmade in a machine-made world.',
  contentMode: 'preset',
  fontSize: 48,
  lineHeight: 1.5,
  padding: 80,
};

export const useCardStore = create<CardState & CardActions>()(
  immer((set, get) => ({
    currentCard: null,
    savedCards: [],
    presetQuotes: PRESET_QUOTES,
    isExporting: false,

    createCard(fontId) {
      const card: CardConfig = {
        ...DEFAULT_CARD,
        id: nanoid(),
        fontId,
      };
      set((state) => { state.currentCard = card; });
      return card;
    },

    updateCard(updates) {
      set((state) => {
        if (!state.currentCard) return;
        Object.assign(state.currentCard, updates);
      });
    },

    async saveCard() {
      const { currentCard } = get();
      if (!currentCard) return;
      await cardRepo.save(currentCard);
    },

    async loadCards(fontId) {
      const cards = await cardRepo.getByFontId(fontId);
      set((state) => { state.savedCards = cards; });
    },

    async deleteCard(id) {
      await cardRepo.delete(id);
      set((state) => {
        state.savedCards = state.savedCards.filter((c) => c.id !== id);
        if (state.currentCard?.id === id) state.currentCard = null;
      });
    },

    setTemplate(template) {
      set((state) => {
        if (state.currentCard) state.currentCard.template = template;
      });
    },

    setColor(color) {
      set((state) => {
        if (state.currentCard) state.currentCard.color = color;
      });
    },

    setText(text) {
      set((state) => {
        if (state.currentCard) state.currentCard.text = text;
      });
    },

    setMode(mode) {
      set((state) => {
        if (state.currentCard) state.currentCard.contentMode = mode;
      });
    },

    setIsExporting(v) {
      set((state) => { state.isExporting = v; });
    },
  }))
);
