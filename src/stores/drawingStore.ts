import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { Stroke, Point, CanvasConfig } from '@/types';

interface DrawingState {
  currentGlyphIndex: number;
  strokes: Stroke[];
  undoStack: Stroke[][];
  redoStack: Stroke[][];
  isDrawing: boolean;
  activeStrokeId: string | null;
  canvasConfig: CanvasConfig;
  isMobile: boolean;
}

interface DrawingActions {
  beginStroke: (point: Point) => void;
  addPoint: (point: Point) => void;
  endStroke: () => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  setStrokes: (strokes: Stroke[]) => void;
  setGlyphIndex: (index: number) => void;
  setCanvasConfig: (config: Partial<CanvasConfig>) => void;
  setIsMobile: (isMobile: boolean) => void;
}

const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  width: 500,
  height: 500,
  strokeWidth: 3,
  strokeColor: '#1A1A1A',
  showGuides: true,
  showGhostChar: true,
};

const MOBILE_CANVAS_CONFIG: CanvasConfig = {
  ...DEFAULT_CANVAS_CONFIG,
  width: 350,
  height: 350,
};

export const useDrawingStore = create<DrawingState & DrawingActions>()(
  immer((set, get) => ({
    currentGlyphIndex: 0,
    strokes: [],
    undoStack: [],
    redoStack: [],
    isDrawing: false,
    activeStrokeId: null,
    canvasConfig: DEFAULT_CANVAS_CONFIG,
    isMobile: false,

    beginStroke(point) {
      const { canvasConfig } = get();
      const strokeId = nanoid();
      set((state) => {
        state.isDrawing = true;
        state.activeStrokeId = strokeId;
        state.redoStack = [];
        state.strokes.push({
          id: strokeId,
          points: [point],
          width: canvasConfig.strokeWidth,
          color: canvasConfig.strokeColor,
        });
      });
    },

    addPoint(point) {
      const { activeStrokeId, isDrawing } = get();
      if (!isDrawing || !activeStrokeId) return;
      set((state) => {
        const stroke = state.strokes.find((s) => s.id === activeStrokeId);
        if (stroke) stroke.points.push(point);
      });
    },

    endStroke() {
      set((state) => {
        state.isDrawing = false;
        state.undoStack.push([...state.strokes]);
        state.activeStrokeId = null;
      });
    },

    undo() {
      const { undoStack, strokes } = get();
      if (undoStack.length <= 1) {
        set((state) => {
          state.redoStack.push([...state.strokes]);
          state.strokes = [];
          state.undoStack = [];
        });
        return;
      }
      set((state) => {
        state.redoStack.push([...strokes]);
        state.undoStack.pop();
        state.strokes = [...(state.undoStack[state.undoStack.length - 1] ?? [])];
      });
    },

    redo() {
      const { redoStack } = get();
      if (redoStack.length === 0) return;
      set((state) => {
        const next = state.redoStack.pop()!;
        state.undoStack.push(next);
        state.strokes = [...next];
      });
    },

    clear() {
      set((state) => {
        state.undoStack.push([...state.strokes]);
        state.redoStack = [];
        state.strokes = [];
      });
    },

    setStrokes(strokes) {
      set((state) => {
        state.strokes = strokes;
        state.undoStack = [strokes];
        state.redoStack = [];
      });
    },

    setGlyphIndex(index) {
      set((state) => {
        state.currentGlyphIndex = index;
        state.strokes = [];
        state.undoStack = [];
        state.redoStack = [];
      });
    },

    setCanvasConfig(config) {
      set((state) => {
        state.canvasConfig = { ...state.canvasConfig, ...config };
      });
    },

    setIsMobile(isMobile) {
      set((state) => {
        state.isMobile = isMobile;
        state.canvasConfig = isMobile ? MOBILE_CANVAS_CONFIG : DEFAULT_CANVAS_CONFIG;
      });
    },
  }))
);
