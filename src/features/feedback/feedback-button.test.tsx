import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';
import { MemoryRouter } from 'react-router';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vite-plus/test';

import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

import { FeedbackButton } from './feedback-button';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function renderButton() {
  return render(
    <MemoryRouter initialEntries={['/lessons/use-memo?tab=app2']}>
      <TooltipProvider>
        <SidebarProvider>
          <FeedbackButton />
        </SidebarProvider>
      </TooltipProvider>
    </MemoryRouter>,
  );
}

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Send feedback' }));
  await user.type(screen.getByLabelText('Title'), 'Wrong answer');
  await user.type(screen.getByLabelText('What happened?'), 'Logs twice.');
  await user.click(screen.getByRole('button', { name: 'File issue' }));
}

describe('FeedbackButton', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    // jsdom has no matchMedia; the sidebar's mobile hook reads it.
    window.matchMedia ??= ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test('posts the feedback with the page, closes and toasts the issue', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        url: 'https://github.com/o/r/issues/42',
        number: 42,
      }),
    );
    renderButton();

    await fillAndSubmit();

    expect(fetchMock).toHaveBeenCalledWith('/__feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Wrong answer',
        description: 'Logs twice.',
        page: '/lessons/use-memo?tab=app2',
      }),
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledOnce());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('keeps the dialog and the text when filing fails', async () => {
    fetchMock.mockResolvedValue(
      Response.json({ error: 'gh is not logged in' }, { status: 500 }),
    );
    renderButton();

    await fillAndSubmit();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('gh is not logged in'),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Wrong answer');
  });
});
