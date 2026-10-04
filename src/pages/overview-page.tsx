import { Link } from 'react-router';
import { ArrowRightIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { lessons } from '@/features/lessons/registry';

export function OverviewPage() {
  const variantCount = lessons.reduce(
    (total, lesson) => total + lesson.variants.length,
    0,
  );

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          React trick questions
        </h1>
        <p className='max-w-2xl text-muted-foreground'>
          {lessons.length} lessons, {variantCount} questions. Read the code,
          guess what logs or re-renders, then reveal the live preview and the
          explanation.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            to={`/lessons/${lesson.id}`}
            className='group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50'>
            <Card className='h-full transition-colors group-hover:bg-muted/50'>
              <CardHeader>
                <CardTitle>{lesson.title}</CardTitle>
                <CardDescription>{lesson.summary}</CardDescription>
              </CardHeader>
              <CardFooter className='mt-auto justify-between'>
                <Badge variant='secondary'>
                  {lesson.variants.length} questions
                </Badge>
                <ArrowRightIcon className='size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
