import type { Metadata } from 'next';
import { FontLibraryClient } from '@/features/font-library/FontLibraryClient';

export const metadata: Metadata = {
  title: 'Font Library',
  description: 'Manage your handwriting fonts.',
};

export default function FontsPage() {
  return <FontLibraryClient />;
}
