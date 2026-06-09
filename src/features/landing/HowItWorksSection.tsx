'use client';

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

const STEPS = [
  { number: '01', title: 'Draw', description: 'Write each letter on the canvas with your finger or mouse.' },
  { number: '02', title: 'Generate', description: 'Your strokes are normalized and transformed into a real font.' },
  { number: '03', title: 'Create', description: 'Use your font to make beautiful post-it cards to share.' },
  { number: '04', title: 'Share', description: 'Download your font and card images. Love your hand.' },
] as const;

export function HowItWorksSection() {
  return (
    <section className="py-24 px-6 border-t border-[#EAEAEA]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-center"
        >
          <p className="text-label text-[#6B6B6B] mb-3">How it works</p>
          <h2 className="text-headline font-normal">Four steps to your font.</h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"
        >
          {STEPS.map((step) => (
            <motion.div key={step.number} variants={staggerItem} className="flex flex-col gap-4">
              <span className="text-label text-[#EAEAEA] text-2xl font-normal">{step.number}</span>
              <div className="h-px w-8 bg-[#1A1A1A]" />
              <h3 className="text-title font-normal">{step.title}</h3>
              <p className="text-body text-[#6B6B6B] text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
