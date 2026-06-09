/**
 * Analytics — lightweight event tracking
 *
 * Events defined in PRD §21. In production, wire the `send` function
 * to your provider (Vercel Analytics, GA4, Amplitude, etc.).
 * In development, events are logged to the console only.
 */

export type AnalyticsEvent =
  | 'landing_visit'
  | 'start_creation'
  | 'glyph_completed'
  | 'font_generated'
  | 'font_downloaded'
  | 'card_generated'
  | 'card_downloaded'
  | 'card_shared'
  | 'session_recovered'
  | 'font_deleted';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

function send(event: AnalyticsEvent, props?: EventProperties): void {
  if (typeof window === 'undefined') return;

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, props ?? '');
    return;
  }

  // Vercel Analytics (auto-injected if @vercel/analytics is installed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const va = (window as any).va;
  if (typeof va === 'function') {
    va('event', { name: event, ...props });
  }

  // Google Analytics 4
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('event', event, props ?? {});
  }
}

export const analytics = {
  landingVisit:     ()                              => send('landing_visit'),
  startCreation:    (language: string)              => send('start_creation', { language }),
  glyphCompleted:   (character: string, total: number) => send('glyph_completed', { character, total }),
  fontGenerated:    (glyphCount: number)            => send('font_generated', { glyph_count: glyphCount }),
  fontDownloaded:   ()                              => send('font_downloaded'),
  cardGenerated:    (template: string, color: string) => send('card_generated', { template, color }),
  cardDownloaded:   ()                              => send('card_downloaded'),
  cardShared:       ()                              => send('card_shared'),
  sessionRecovered: (fontName: string)              => send('session_recovered', { font_name: fontName }),
  fontDeleted:      ()                              => send('font_deleted'),
};
