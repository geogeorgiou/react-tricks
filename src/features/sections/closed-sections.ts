import { useEffect, useState } from 'react';

import { SECTION_TITLES, type SectionTitle } from '@/features/lessons/registry';

/** localStorage key holding the titles of the Sections a learner closed. */
export const CLOSED_SECTIONS_KEY = 'sidebar_closed_sections';

function isSectionTitle(value: unknown): value is SectionTitle {
  return SECTION_TITLES.some((title) => title === value);
}

export function readClosedSections(): SectionTitle[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(CLOSED_SECTIONS_KEY) ?? '[]',
    );
    return Array.isArray(stored) ? stored.filter(isSectionTitle) : [];
  } catch {
    return [];
  }
}

function writeClosedSections(titles: SectionTitle[]) {
  try {
    localStorage.setItem(CLOSED_SECTIONS_KEY, JSON.stringify(titles));
  } catch {
    // Storage can be full or blocked; the Sections still open and close.
  }
}

/**
 * Which Sections are closed, remembered across reloads. Every Section starts
 * open until the learner closes it.
 *
 * `activeSection` is the Section of the Lesson being shown. Whenever it
 * changes, that Section opens, so the active Lesson is never hidden behind a
 * heading the learner closed earlier.
 */
export function useClosedSections(activeSection: SectionTitle | undefined) {
  const [closed, setClosed] = useState(readClosedSections);

  const [shownSection, setShownSection] = useState<SectionTitle>();
  if (shownSection !== activeSection) {
    setShownSection(activeSection);
    if (activeSection && closed.includes(activeSection)) {
      setClosed(closed.filter((title) => title !== activeSection));
    }
  }

  useEffect(() => {
    writeClosedSections(closed);
  }, [closed]);

  return {
    isOpen: (title: SectionTitle) => !closed.includes(title),
    setSectionOpen: (title: SectionTitle, open: boolean) =>
      setClosed((current) =>
        open
          ? current.filter((closedTitle) => closedTitle !== title)
          : current.includes(title)
            ? current
            : [...current, title],
      ),
  };
}
