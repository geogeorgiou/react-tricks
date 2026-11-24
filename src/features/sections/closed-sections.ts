import { useEffect, useState } from 'react';

import {
  isSectionTitle,
  type Lesson,
  type SectionTitle,
} from '@/features/lessons/registry';

/** localStorage key holding the titles of the Sections a learner closed. */
export const CLOSED_SECTIONS_KEY = 'sidebar_closed_sections';

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

function withoutTitle(titles: SectionTitle[], title: SectionTitle) {
  return titles.filter((closedTitle) => closedTitle !== title);
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
 * `activeLesson` is the Lesson being shown. Whenever it changes, its Section
 * opens, so the active Lesson is never hidden behind a heading the learner
 * closed earlier.
 */
export function useClosedSections(
  activeLesson: Pick<Lesson, 'id' | 'section'> | undefined,
) {
  const [closed, setClosed] = useState(readClosedSections);

  const [prevActiveLessonId, setPrevActiveLessonId] = useState<string>();
  if (prevActiveLessonId !== activeLesson?.id) {
    setPrevActiveLessonId(activeLesson?.id);
    if (activeLesson && closed.includes(activeLesson.section)) {
      setClosed(withoutTitle(closed, activeLesson.section));
    }
  }

  useEffect(() => {
    writeClosedSections(closed);
  }, [closed]);

  return {
    isOpen: (title: SectionTitle) => !closed.includes(title),
    setSectionOpen: (title: SectionTitle, open: boolean) =>
      setClosed((current) => {
        const others = withoutTitle(current, title);
        return open ? others : [...others, title];
      }),
  };
}
