'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';

export function CtaSection() {
  const router = useRouter();

  return (
    <section className="py-32 px-6 border-t border-[#EAEAEA]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-xl mx-auto text-center"
      >
        <p className="text-label text-[#6B6B6B] mb-6">Ready?</p>
        <h2 className="text-headline font-normal mb-4">
          Your handwriting deserves<br />a place in the digital world.
        </h2>
        <p className="text-body text-[#6B6B6B] mb-10">
          No account. No download. Runs entirely in your browser.
        </p>
        <Button size="lg" variant="primary" onClick={() => router.push('/create')}>
          Make Your Font — it&apos;s free
        </Button>
      </motion.div>
    </section>
  );
}
