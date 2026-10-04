import { useEffect, useRef, useSyncExternalStore } from 'react';
import { BanIcon, TerminalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  clearEntries,
  getEntries,
  subscribe,
  type ConsoleLevel,
} from './sandbox';

const levelStyles: Record<ConsoleLevel, string> = {
  log: 'text-foreground',
  info: 'text-sky-600 dark:text-sky-400',
  debug: 'text-muted-foreground',
  warn: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  error: 'bg-destructive/10 text-destructive',
};

export function ConsolePanel() {
  const entries = useSyncExternalStore(subscribe, getEntries);
  const logRef = useRef<HTMLDivElement>(null);

  // Keep the newest entry in view without scrolling the page itself.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [entries]);

  return (
    <Card size='sm' className='gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle className='flex items-center gap-2'>
          <TerminalIcon className='size-4' />
          Console
          <span className='text-xs font-normal text-muted-foreground'>
            {entries.length}
          </span>
        </CardTitle>
        <CardAction>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={clearEntries}
            aria-label='Clear console'>
            <BanIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <div
        ref={logRef}
        className='h-56 overflow-y-auto font-mono text-xs'
        role='log'
        aria-live='polite'>
        {entries.length === 0 ? (
          <p className='p-3 text-muted-foreground'>
            Nothing logged yet. Interact with the preview.
          </p>
        ) : (
          <ol>
            {entries.map((entry) => (
              <li
                key={entry.id}
                className={cn(
                  'border-b px-3 py-1 whitespace-pre-wrap last:border-b-0',
                  levelStyles[entry.level],
                )}>
                {entry.message}
              </li>
            ))}
          </ol>
        )}
      </div>
    </Card>
  );
}
