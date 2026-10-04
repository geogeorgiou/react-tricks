import { Suspense, use, useMemo, useState } from 'react';
import { CheckIcon, CopyIcon, FileCodeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card';
import { getHighlighter } from './highlighter';

type CodeBlockProps = {
  code: string;
  fileName: string;
};

export function CodeBlock({ code, fileName }: CodeBlockProps) {
  return (
    <Card size='sm' className='min-w-0 gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle className='flex items-center gap-2 font-mono text-sm'>
          <FileCodeIcon className='size-4' />
          {fileName}
        </CardTitle>
        <CardAction>
          <CopyButton code={code} />
        </CardAction>
      </CardHeader>
      <div className='code-block overflow-x-auto py-3 text-[13px] leading-relaxed'>
        <Suspense fallback={<PlainCode code={code} />}>
          <HighlightedCode code={code} />
        </Suspense>
      </div>
    </Card>
  );
}

function HighlightedCode({ code }: { code: string }) {
  const highlighter = use(getHighlighter());
  const html = useMemo(
    () =>
      highlighter.codeToHtml(code.trimEnd(), {
        lang: 'tsx',
        themes: { light: 'github-light', dark: 'github-dark' },
        defaultColor: 'light',
      }),
    [highlighter, code],
  );

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function PlainCode({ code }: { code: string }) {
  return (
    <pre className='shiki'>
      <code>
        {code
          .trimEnd()
          .split('\n')
          .map((line, index) => (
            <span key={index} className='line'>
              {line}
              {'\n'}
            </span>
          ))}
      </code>
    </pre>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      variant='ghost'
      size='icon-sm'
      onClick={copy}
      aria-label={copied ? 'Copied' : 'Copy code'}>
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
}
