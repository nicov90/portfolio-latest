// Katakana is the expected way to render a foreign name once everything around it is in
// Japanese (see RotatingGreeting.tsx) — kept in sync with the navbar logo and document title.
export const SITE_OWNER_NAME: Record<string, string> = {
  en: 'Nicolas Valdez',
  es: 'Nicolas Valdez',
  ja: 'ニコラス・バルデス',
};

export function getSiteOwnerName(language: string): string {
  return SITE_OWNER_NAME[language] ?? SITE_OWNER_NAME.en;
}
