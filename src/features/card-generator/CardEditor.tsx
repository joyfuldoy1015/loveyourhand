'use client';

import { motion } from 'framer-motion';
import type { PostitColor, FontLanguage } from '@/types';

const COLORS: { value: PostitColor; hex: string; label: string }[] = [
  { value: 'yellow', hex: '#FFF3A3', label: 'Yellow' },
  { value: 'pink',   hex: '#FFD6E0', label: 'Pink'   },
  { value: 'blue',   hex: '#C8E6FF', label: 'Blue'   },
  { value: 'white',  hex: '#FFFFFF', label: 'White'  },
  { value: 'cream',  hex: '#FAF0E6', label: 'Cream'  },
];

const PRESETS: Record<string, string[]> = {
  en: [
    'Handmade in a machine-made world.',
    'Love your hand.',
    'Some things are better imperfect.',
    'Your handwriting deserves a place in the digital world.',
    'Turn your handwriting into something worth keeping.',
  ],
  ko: [
    '내 손글씨',
    '사랑해',
    '오늘도 잘 해',
    '한 번 더',
    '이 글씨 내 거',
  ],
  ja: [
    'てのきせき',
    'わたしのて',
    'ひとつのもの',
    'てにとるきおく',
    'そのてのかたち',
  ],
  mixed: [
    'Handmade in a machine-made world.',
    'Love your hand.',
    'ㄴㅐ ㅅㅗㄴㄱㅡㄹㅆㅣ',
    'Some things are better imperfect.',
    'ㅅㅏㄹㄹㅏㅇ ㅎㅐ',
  ],
};

type ContentMode = 'preset' | 'custom';

interface Props {
  text: string;
  color: PostitColor;
  fontSize: number;
  lineHeight: number;
  padding: number;
  template: 'postit' | 'note' | 'polaroid';
  contentMode: ContentMode;
  language?: FontLanguage;
  onText: (v: string) => void;
  onColor: (v: PostitColor) => void;
  onFontSize: (v: number) => void;
  onLineHeight: (v: number) => void;
  onPadding: (v: number) => void;
  onTemplate: (v: 'postit' | 'note' | 'polaroid') => void;
  onContentMode: (v: ContentMode) => void;
}

export function CardEditor({
  text, color, fontSize, lineHeight, padding, template, contentMode, language,
  onText, onColor, onFontSize, onLineHeight, onPadding, onTemplate, onContentMode,
}: Props) {
  const presets = PRESETS[language ?? 'en'] ?? PRESETS.en;
  return (
    <div className="space-y-6">

      {/* Template */}
      <Section label="Template">
        <div className="flex gap-2">
          {(['postit', 'note', 'polaroid'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onTemplate(t)}
              className={`flex-1 h-8 rounded-xl text-xs font-medium capitalize transition-colors ${
                template === t
                  ? 'bg-[#1A1A1A] text-[#FAFAF8]'
                  : 'bg-[#F5F5F3] text-[#6B6B6B] hover:bg-[#EAEAEA]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      {/* Color */}
      <Section label="Color">
        <div className="flex gap-2.5">
          {COLORS.map((c) => (
            <motion.button
              key={c.value}
              whileTap={{ scale: 0.88 }}
              onClick={() => onColor(c.value)}
              aria-label={c.label}
              className={`w-9 h-9 rounded-full border-2 transition-all ${
                color === c.value ? 'border-[#1A1A1A] scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.hex, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
            />
          ))}
        </div>
      </Section>

      {/* Text mode */}
      <Section label="Text">
        <div className="flex gap-1.5 mb-3">
          {(['preset', 'custom'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onContentMode(m)}
              className={`flex-1 h-7 rounded-full text-[11px] font-medium capitalize transition-colors ${
                contentMode === m
                  ? 'bg-[#1A1A1A] text-[#FAFAF8]'
                  : 'bg-[#F5F5F3] text-[#6B6B6B] hover:bg-[#EAEAEA]'
              }`}
            >
              {m === 'preset' ? 'Preset Quotes' : 'Write Your Own'}
            </button>
          ))}
        </div>

        {contentMode === 'preset' ? (
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {presets.map((q) => (
              <button
                key={q}
                onClick={() => onText(q)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                  text === q
                    ? 'bg-[#1A1A1A] text-[#FAFAF8]'
                    : 'bg-[#F5F5F3] text-[#4B4B4B] hover:bg-[#EAEAEA]'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => onText(e.target.value.slice(0, 120))}
            placeholder="Write something..."
            maxLength={120}
            rows={3}
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#EAEAEA] bg-white resize-none focus:outline-none focus:border-[#ABABAB] text-[#1A1A1A] placeholder:text-[#ABABAB]"
          />
        )}
      </Section>

      {/* Typography */}
      <Section label="Typography">
        <SliderRow
          label="Font size"
          value={fontSize}
          min={40}
          max={120}
          step={4}
          display={`${fontSize}px`}
          onChange={onFontSize}
        />
        <SliderRow
          label="Line height"
          value={lineHeight}
          min={1.1}
          max={2.2}
          step={0.05}
          display={lineHeight.toFixed(2)}
          onChange={onLineHeight}
        />
        <SliderRow
          label="Padding"
          value={padding}
          min={48}
          max={180}
          step={8}
          display={`${padding}px`}
          onChange={onPadding}
        />
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium tracking-widest uppercase text-[#ABABAB] mb-2.5">{label}</p>
      {children}
    </div>
  );
}

function SliderRow({
  label, value, min, max, step, display, onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-xs text-[#6B6B6B] w-20 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 appearance-none bg-[#EAEAEA] rounded-full outline-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1A1A1A]"
      />
      <span className="text-xs text-[#6B6B6B] w-12 text-right tabular-nums">{display}</span>
    </div>
  );
}
