'use client';

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

const SAMPLE_CARDS = [
  {
    id: 1,
    text: 'Handmade\nin a machine-\nmade world.',
    color: '#FFF3A3',
    rotate: -2,
  },
  {
    id: 2,
    text: 'Love\nyour\nhand.',
    color: '#FFD6E0',
    rotate: 1.5,
  },
  {
    id: 3,
    text: 'Some things\nare better\nimperfect.',
    color: '#C8E6FF',
    rotate: -1,
  },
];

const COLOR_LABELS: Record<string, string> = {
  '#FFF3A3': 'Yellow',
  '#FFD6E0': 'Pink',
  '#C8E6FF': 'Blue',
};

export function ExamplesSection() {
  return (
    <section id="examples" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-center"
        >
          <p className="text-label text-[#6B6B6B] mb-3">What you can make</p>
          <h2 className="text-headline font-normal">Your handwriting,<br />beautifully rendered.</h2>
        </motion.div>

        {/* Cards showcase */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="flex flex-wrap justify-center gap-6 md:gap-8"
        >
          {SAMPLE_CARDS.map((card) => (
            <motion.div
              key={card.id}
              variants={staggerItem}
              style={{ rotate: card.rotate }}
              whileHover={{ scale: 1.04, rotate: 0, transition: { duration: 0.2 } }}
              className="relative cursor-pointer"
            >
              <div
                className="w-48 h-48 md:w-56 md:h-56 rounded-[4px] p-6 flex flex-col justify-between"
                style={{
                  backgroundColor: card.color,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                }}
              >
                <p
                  className="text-[#1A1A1A] whitespace-pre-line leading-tight"
                  style={{ fontFamily: 'serif', fontSize: '1.1rem', letterSpacing: '-0.01em' }}
                >
                  {card.text}
                </p>
                <p className="text-[8px] text-[rgba(0,0,0,0.3)] tracking-wider uppercase">
                  made with loveyourhand
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Palette preview */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-12 flex items-center justify-center gap-3"
        >
          {Object.entries(COLOR_LABELS).map(([hex, label]) => (
            <div key={hex} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-[#EAEAEA]"
                style={{ backgroundColor: hex }}
              />
              <span className="text-xs text-[#6B6B6B]">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
