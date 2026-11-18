import { Navigate, useParams, useSearchParams } from 'react-router';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionView } from '@/features/lessons/question-view';
import { findLesson } from '@/features/lessons/registry';

import { NotFoundPage } from './not-found-page';

export function LessonPage() {
  const { lessonId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const lesson = findLesson(lessonId);

  if (!lesson) return <NotFoundPage />;

  const tab = searchParams.get('tab');
  const question = lesson.questions.find((q) => q.id === tab);

  if (!question) {
    return <Navigate replace to={`?tab=${lesson.questions[0].id}`} />;
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
        value={question.id}
        onValueChange={(next) => setSearchParams({ tab: next })}>
        <div className='-mx-1 overflow-x-auto px-1 pb-1'>
          <TabsList>
            {lesson.questions.map((q, index) => (
              <TabsTrigger key={q.id} value={q.id} title={q.title}>
                <span className='text-muted-foreground'>{index + 1}.</span>
                {q.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {/* Keyed so reveal state and the preview reset when switching tabs */}
      <QuestionView key={`${lesson.id}/${question.id}`} question={question} />
    </div>
  );
}
