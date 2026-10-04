import { ShieldCheckIcon, ZapIcon } from 'lucide-react';

/**
 * StrictMode only does its extra checks in development builds, so lessons
 * that log during render or in effects behave differently locally and on the
 * deployed site. This says which one the viewer is looking at.
 */
export function StrictModeBadge() {
  const isDev = import.meta.env.DEV;

  return (
    <div className='flex w-fit items-start gap-2 rounded-md border bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground'>
      {isDev ? (
        <ShieldCheckIcon className='mt-px size-3.5 shrink-0 text-amber-600 dark:text-amber-400' />
      ) : (
        <ZapIcon className='mt-px size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400' />
      )}
      <span>
        {isDev ? (
          <>
            <strong className='font-medium text-foreground'>
              Development build, StrictMode on:
            </strong>{' '}
            components render twice and effects mount, clean up and mount again,
            so you&apos;ll see some logs doubled.
          </>
        ) : (
          <>
            <strong className='font-medium text-foreground'>
              Production build, StrictMode off:
            </strong>{' '}
            each render and effect runs once. Run the project locally to see
            StrictMode&apos;s double invocations.
          </>
        )}
      </span>
    </div>
  );
}
