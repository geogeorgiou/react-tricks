import { useEffect, useState, type ComponentType } from 'react';
import { MonitorPlayIcon, RotateCcwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ConsolePanel } from './console-panel';
import { PreviewErrorBoundary } from './preview-error-boundary';
import { beginSession, retainSession } from './sandbox';

type PreviewHostProps = {
  component: ComponentType;
};

export function PreviewHost({ component }: PreviewHostProps) {
  const [runId, setRunId] = useState(0);

  return (
    <div className='flex flex-col gap-4'>
      <Card size='sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MonitorPlayIcon className='size-4' />
            Preview
          </CardTitle>
          <CardAction>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setRunId((id) => id + 1)}>
              <RotateCcwIcon />
              Reset
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className='lesson-preview min-h-24 rounded-lg border border-dashed p-4'>
            <SandboxSession key={runId} component={component} />
          </div>
        </CardContent>
      </Card>
      <ConsolePanel />
    </div>
  );
}

/**
 * Owns one recording session; remounting it (via `key`) starts a fresh one.
 * The session begins during render so logs from the preview's very first
 * render are captured.
 */
function SandboxSession({ component: Preview }: PreviewHostProps) {
  useState(beginSession);
  useEffect(retainSession, []);

  return (
    <PreviewErrorBoundary>
      <Preview />
    </PreviewErrorBoundary>
  );
}
