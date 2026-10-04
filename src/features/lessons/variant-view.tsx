import { useState } from 'react';
import { EyeIcon, LockIcon, MessageCircleQuestionIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PreviewHost } from '@/features/preview/preview-host';
import { CodeBlock } from './code-block';
import { InlineMarkdown } from './inline-markdown';
import type { Variant } from './registry';
import { StrictModeBadge } from './strict-mode-badge';

export function VariantView({ variant }: { variant: Variant }) {
  const [revealed, setRevealed] = useState(false);
  const reveal = () => setRevealed(true);

  return (
    <div className='flex flex-col gap-4'>
      <Card size='sm'>
        <CardContent className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-start gap-3'>
            <MessageCircleQuestionIcon className='mt-0.5 size-5 shrink-0 text-muted-foreground' />
            <div className='flex flex-col gap-2'>
              <p className='font-medium text-balance'>
                <InlineMarkdown text={variant.question} />
              </p>
              {variant.strictModeSensitive ? <StrictModeBadge /> : null}
            </div>
          </div>
          {revealed ? null : (
            <Button onClick={reveal} className='shrink-0'>
              <EyeIcon />
              Reveal answer
            </Button>
          )}
        </CardContent>
      </Card>

      <div className='grid gap-4 lg:grid-cols-2'>
        <CodeBlock code={variant.source} fileName={variant.fileName} />
        {revealed ? (
          <PreviewHost component={variant.Component} />
        ) : (
          <LockedPreview onReveal={reveal} />
        )}
      </div>

      {revealed ? (
        <Card>
          <CardHeader>
            <CardTitle>Explanation</CardTitle>
          </CardHeader>
          <CardContent>
            <article className='explanation prose prose-sm max-w-none prose-neutral dark:prose-invert'>
              <variant.Explanation />
            </article>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function LockedPreview({ onReveal }: { onReveal: () => void }) {
  return (
    <Card className='items-center justify-center border-dashed text-center'>
      <CardContent className='flex flex-col items-center gap-3 py-10'>
        <LockIcon className='size-6 text-muted-foreground' />
        <div className='flex flex-col gap-1'>
          <p className='font-medium'>Make your guess first</p>
          <p className='max-w-xs text-sm text-muted-foreground'>
            Read the code and predict what happens. Revealing runs the component
            live, captures its console output and explains why.
          </p>
        </div>
        <Button variant='outline' onClick={onReveal}>
          <EyeIcon />
          Reveal answer
        </Button>
      </CardContent>
    </Card>
  );
}
