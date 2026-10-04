import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AppLayout } from '@/app/app-layout';
import { installSandbox } from '@/features/preview/sandbox';
import { LessonPage } from '@/pages/lesson-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { OverviewPage } from '@/pages/overview-page';
import './index.css';

// Patch console + setInterval before any lesson code runs.
installSandbox();

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'lessons/:lessonId', element: <LessonPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

// StrictMode only affects development builds: lesson previews follow the
// environment, and lessons flagged `strictModeSensitive` explain the difference.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
