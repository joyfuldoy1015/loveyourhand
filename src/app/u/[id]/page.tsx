import type { Metadata } from 'next';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: 'Shared Font',
    description: 'Someone shared their handwriting font with you.',
    openGraph: {
      title: 'A handwriting font made with Loveyourhand',
      description: 'Turn your own handwriting into a font at loveyourhand.app',
      url: `https://loveyourhand.app/u/${id}`,
    },
  };
}

export default async function SharedFontPage({ params }: Props) {
  const { id } = await params;

  // P1: fetch shared font from Supabase by `id` and render preview
  // For now, show a coming-soon state that still drives CTA traffic

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] font-medium tracking-widest uppercase text-[#ABABAB] mb-4">
        Shared Font
      </p>
      <h1 className="text-2xl font-normal text-[#1A1A1A] mb-3">
        Public sharing is coming soon
      </h1>
      <p className="text-sm text-[#6B6B6B] mb-2 max-w-xs">
        This link (<code className="text-xs bg-[#F0F0EE] px-1 py-0.5 rounded">/u/{id}</code>) will
        display a shareable font preview in a future update.
      </p>
      <p className="text-sm text-[#6B6B6B] mb-10 max-w-xs">
        In the meantime, create your own handwriting font — it takes just a few minutes.
      </p>
      <Link
        href="/create"
        className="h-10 px-8 rounded-full bg-[#1A1A1A] text-[#FAFAF8] text-sm font-medium inline-flex items-center"
      >
        Make Your Font
      </Link>
    </div>
  );
}
