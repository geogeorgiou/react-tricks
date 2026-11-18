import { MessageSquarePlusIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';

import { FEEDBACK_ENDPOINT } from './feedback-endpoint';

type FeedbackResponse = { url: string; number: number } | { error: string };

async function postFeedback(form: FormData, page: string) {
  const response = await fetch(FEEDBACK_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: form.get('title'),
      description: form.get('description'),
      page,
    }),
  });
  const body = (await response.json()) as FeedbackResponse;
  if ('error' in body) throw new Error(body.error);
  return body;
}

/**
 * Dev only. Files what you type as a GitHub issue on origin through the dev
 * server's `/__feedback`, which runs `gh issue create` as you.
 */
export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [filing, setFiling] = useState(false);
  const location = useLocation();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setFiling(true);
    try {
      const issue = await postFeedback(
        new FormData(form),
        location.pathname + location.search,
      );
      form.reset();
      setOpen(false);
      toast.success(
        <span>
          Issue #{issue.number} filed.{' '}
          <a
            href={issue.url}
            target='_blank'
            rel='noreferrer'
            className='font-medium underline'>
            Open
          </a>
        </span>,
      );
    } catch (error) {
      // The dialog stays open with the text kept, so it can be sent again.
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setFiling(false);
    }
  };

  return (
    <>
      <SidebarMenuButton tooltip='Send feedback' onClick={() => setOpen(true)}>
        <MessageSquarePlusIcon />
        <span>Send feedback</span>
      </SidebarMenuButton>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send feedback</DialogTitle>
            <DialogDescription>
              Files a GitHub issue on this repo, as you.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className='space-y-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='feedback-title'>Title</Label>
              <Input id='feedback-title' name='title' required />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='feedback-description'>What happened?</Label>
              {/* Capped so a long description scrolls instead of growing the dialog. */}
              <Textarea
                id='feedback-description'
                name='description'
                rows={4}
                required
                className='max-h-[40vh] overflow-y-auto'
              />
            </div>
            <DialogFooter className='pt-2'>
              <Button type='submit' disabled={filing}>
                {filing ? 'Filing…' : 'File issue'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
