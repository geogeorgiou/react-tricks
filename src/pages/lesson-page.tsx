import { Navigate, useParams, useSearchParams } from 'react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { findLesson } from '@/features/lessons/registry';
import { VariantView } from '@/features/lessons/variant-view';
import { NotFoundPage } from './not-found-page';

export function LessonPage() {
  const { lessonId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const lesson = findLesson(lessonId);

  if (!lesson) return <NotFoundPage />;

  const tab = searchParams.get('tab');
  const variant = lesson.variants.find((v) => v.id === tab);

  if (!variant) {
    return <Navigate replace to={`?tab=${lesson.variants[0].id}`} />;
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          {lesson.title}
        </h1>
        <div className='prose prose-sm max-w-3xl text-muted-foreground dark:prose-invert'>
          <lesson.Intro />
        </div>
      </div>

      <Tabs
        value={variant.id}
        onValueChange={(next) => setSearchParams({ tab: next })}>
        <div className='-mx-1 overflow-x-auto px-1 pb-1'>
          <TabsList>
            {lesson.variants.map((v, index) => (
              <TabsTrigger key={v.id} value={v.id} title={v.title}>
                <span className='text-muted-foreground'>{index + 1}.</span>
                {v.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {/* Keyed so reveal state and the preview reset when switching tabs */}
      <VariantView key={`${lesson.id}/${variant.id}`} variant={variant} />
    </div>
  );
}
