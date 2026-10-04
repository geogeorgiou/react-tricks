import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className='flex flex-col items-start gap-3 py-12'>
      <h1 className='text-2xl font-semibold tracking-tight'>Page not found</h1>
      <p className='text-muted-foreground'>
        That lesson doesn&apos;t exist (or was renamed).
      </p>
      <Button asChild variant='outline'>
        <Link to='/'>Back to overview</Link>
      </Button>
    </div>
  );
}
