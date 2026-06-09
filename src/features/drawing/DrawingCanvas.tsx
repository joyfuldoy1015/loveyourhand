'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { Point, Stroke } from '@/types';
import { drawSmoothStroke, drawGuides } from '@/lib/normalizer';

interface Props {
  width: number;
  height: number;
  strokes: Stroke[];
  strokeWidth: number;
  strokeColor?: string;
  showGuides?: boolean;
  ghostChar?: string;
  onStrokesChange: (strokes: Stroke[]) => void;
}

let strokeIdCounter = 0;
const nextId = () => `s${++strokeIdCounter}`;

export function DrawingCanvas({
  width,
  height,
  strokes,
  strokeWidth,
  strokeColor = '#1A1A1A',
  showGuides = true,
  ghostChar,
  onStrokesChange,
}: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const dprRef     = useRef(1);

  // local refs – no React state to avoid re-renders during drawing
  const isDrawingRef     = useRef(false);
  const currentPtsRef    = useRef<Point[]>([]);
  const strokesRef       = useRef<Stroke[]>(strokes);
  const strokeWidthRef   = useRef(strokeWidth);
  const strokeColorRef   = useRef(strokeColor);

  // keep refs in sync with props
  useEffect(() => { strokesRef.current = strokes; }, [strokes]);
  useEffect(() => { strokeWidthRef.current = strokeWidth; }, [strokeWidth]);
  useEffect(() => { strokeColorRef.current = strokeColor; }, [strokeColor]);

  // ── Canvas setup (HiDPI) ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
  }, [width, height]);

  // ── Render ────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, width, height);

    // background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // guide lines
    if (showGuides) drawGuides(ctx, width, height);

    // ghost character
    if (ghostChar) {
      ctx.save();
      const fontSize = Math.floor(height * 0.52);
      ctx.font = `${fontSize}px 'Georgia', serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillText(ghostChar, width / 2, height * 0.76);
      ctx.restore();
    }

    // completed strokes
    for (const stroke of strokesRef.current) {
      drawSmoothStroke(ctx, stroke.points, stroke.width, stroke.color ?? '#1A1A1A');
    }

    // live stroke
    if (currentPtsRef.current.length > 0) {
      drawSmoothStroke(ctx, currentPtsRef.current, strokeWidthRef.current, strokeColorRef.current);
    }
  }, [width, height, showGuides, ghostChar]);

  // re-render when strokes prop changes (undo/redo/clear from parent)
  useEffect(() => { render(); }, [strokes, render]);

  // ── Pointer coordinates ───────────────────────────────────────
  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left),
      y: (e.clientY - rect.top),
      pressure: e.pressure ?? 0.5,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    currentPtsRef.current = [getPoint(e)];
    render();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    currentPtsRef.current.push(getPoint(e));
    render();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    isDrawingRef.current = false;

    const pts = currentPtsRef.current;
    currentPtsRef.current = [];

    if (pts.length === 0) return;

    const newStroke: Stroke = {
      id: nextId(),
      points: pts,
      width: strokeWidthRef.current,
      color: strokeColorRef.current,
    };
    const updated = [...strokesRef.current, newStroke];
    strokesRef.current = updated;
    onStrokesChange(updated);
    render();
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block', cursor: 'crosshair', touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      aria-label={ghostChar ? `Draw the character: ${ghostChar}` : 'Drawing canvas'}
      role="img"
    />
  );
}

// ─── Imperative handle for undo/redo/clear ────────────────────────
// Parent calls these by updating the strokes prop directly.
// This component is purely controlled via the strokes[] prop.
