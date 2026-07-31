"use client";
import { useI18n } from '../contexts/i18nContext';
import { getSiteOwnerName } from '../../lib/siteOwner';
import type { Section } from './Layout';

const SECTION_TITLE_KEYS: Record<Section, string> = {
  intro: 'navigation.home',
  'about-me': 'navigation.aboutMe',
  experience: 'navigation.experience',
  skills: 'navigation.skills',
  projects: 'navigation.projects',
  certifications: 'navigation.certifications',
  contact: 'navigation.contact',
};

interface DocumentTitleUpdaterProps {
  currentSection: Section;
}

/**
 * Keeps the browser tab title in sync with both the active section and the selected language —
 * "Sección - Nicolas Valdez", or "Inicio - Nicolas Valdez" (localized) while still on the intro.
 *
 * Rendered as an actual <title> element (React 19/Next 15 hoist it to <head> automatically)
 * rather than imperatively setting `document.title` in an effect — the latter loses a fight with
 * Next's own metadata-driven title on the very first hydration, silently reverting back to the
 * static layout.tsx default and never actually updating.
 */
export const DocumentTitleUpdater: React.FC<DocumentTitleUpdaterProps> = ({ currentSection }) => {
  const { t, language } = useI18n();
  const key = SECTION_TITLE_KEYS[currentSection] ?? 'navigation.home';
  return <title>{`${t(key)} - ${getSiteOwnerName(language)}`}</title>;
};
