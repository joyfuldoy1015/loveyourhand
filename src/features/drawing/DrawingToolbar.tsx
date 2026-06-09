'use client';

import { motion } from 'framer-motion';

const PEN_SIZES = [2, 4, 6, 8] as const;

interface Props {
  penSize: number;
  canUndo: boolean;
  canRedo: boolean;
  canClear: boolean;
  onPenSize: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

export function DrawingToolbar({
  penSize, canUndo, canRedo, canClear,
  onPenSize, onUndo, onRedo, onClear,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      {/* Pen size */}
      <div className="flex items-center gap-1.5">
        {PEN_SIZES.map((s) => (
          <button
            key={s}
            onClick={() => onPenSize(s)}
            aria-label={`Pen size ${s}`}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              penSize === s
                ? 'bg-[#1A1A1A]'
                : 'bg-transparent hover:bg-[#F0F0EE]'
            }`}
          >
            <span
              className="rounded-full bg-current"
              style={{
                width: s + 2,
                height: s + 2,
                backgroundColor: penSize === s ? '#FAFAF8' : '#1A1A1A',
              }}
            />
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <IconBtn label="Undo" disabled={!canUndo} onClick={onUndo}>
          <UndoIcon />
        </IconBtn>
        <IconBtn label="Redo" disabled={!canRedo} onClick={onRedo}>
          <RedoIcon />
        </IconBtn>
        <div className="w-px h-4 bg-[#EAEAEA] mx-1" />
        <IconBtn label="Clear" disabled={!canClear} onClick={onClear} danger>
          <ClearIcon />
        </IconBtn>
      </div>
    </div>
  );
}

function IconBtn({
  label, disabled, onClick, danger, children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.92 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
        disabled
          ? 'opacity-25 cursor-not-allowed'
          : danger
          ? 'hover:bg-red-50 hover:text-red-500 text-[#6B6B6B]'
          : 'hover:bg-[#F0F0EE] text-[#6B6B6B] hover:text-[#1A1A1A]'
      }`}
    >
      {children}
    </motion.button>
  );
}

function UndoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 6H10C11.657 6 13 7.343 13 9C13 10.657 11.657 12 10 12H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 4L3 6L5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13 6H6C4.343 6 3 7.343 3 9C3 10.657 4.343 12 6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M11 4L13 6L11 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
