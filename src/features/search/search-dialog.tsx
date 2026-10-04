import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpenIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { lessons } from '@/features/lessons/registry';

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'j' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const goTo = (lessonId: string) => {
    setOpen(false);
    navigate(`/lessons/${lessonId}`);
  };

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        className='ml-auto text-muted-foreground'
        onClick={() => setOpen(true)}>
        <SearchIcon />
        Search
        <kbd className='hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium select-none sm:inline-flex'>
          <span className='text-xs'>⌘</span>J
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title='Search lessons'
        description='Jump to a lesson by its title'>
        <Command>
          <CommandInput placeholder='Search lessons…' />
          <CommandList>
            <CommandEmpty>No lessons found.</CommandEmpty>
            <CommandGroup heading='Lessons'>
              {lessons.map((lesson) => (
                <CommandItem
                  key={lesson.id}
                  value={lesson.title}
                  onSelect={() => goTo(lesson.id)}>
                  <BookOpenIcon />
                  <span className='truncate'>{lesson.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
