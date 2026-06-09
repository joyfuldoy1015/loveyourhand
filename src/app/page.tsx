import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/features/landing/HeroSection';
import { ExamplesSection } from '@/features/landing/ExamplesSection';
import { HowItWorksSection } from '@/features/landing/HowItWorksSection';
import { CtaSection } from '@/features/landing/CtaSection';
import { SessionRecoveryBanner } from '@/features/landing/SessionRecoveryBanner';

export default function HomePage() {
  return (
    <>
      <Header />
      <SessionRecoveryBanner />
      <main className="flex-1">
        <HeroSection />
        <ExamplesSection />
        <HowItWorksSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
