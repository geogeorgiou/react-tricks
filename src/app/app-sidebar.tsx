import {
  AtomIcon,
  BookOpenIcon,
  ChevronDownIcon,
  LayoutGridIcon,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, useMatch } from 'react-router';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { FeedbackButton } from '@/features/feedback/feedback-button';
import { sections, type Section } from '@/features/lessons/registry';
import { ThemeToggle } from '@/features/theme/theme-toggle';

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const isOverview = useMatch('/') !== null;
  const lessonMatch = useMatch('/lessons/:lessonId');
  const closeOnMobile = () => setOpenMobile(false);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <NavLink to='/' onClick={closeOnMobile}>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <AtomIcon className='size-4' />
                </div>
                <div className='grid flex-1 text-left leading-tight'>
                  <span className='truncate font-semibold'>React Tricks</span>
                  <span className='truncate text-xs text-muted-foreground'>
                    Guess, then reveal
                  </span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isOverview}
                  tooltip='Overview'>
                  <NavLink to='/' onClick={closeOnMobile}>
                    <LayoutGridIcon />
                    <span>Overview</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {sections.map((section) => (
          <SidebarSection
            key={section.title}
            section={section}
            activeLessonId={lessonMatch?.params.lessonId}
            onNavigate={closeOnMobile}
          />
        ))}
      </SidebarContent>

      <SidebarFooter>
        {import.meta.env.DEV && (
          <SidebarMenu>
            <SidebarMenuItem>
              <FeedbackButton />
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function SidebarSection({
  section,
  activeLessonId,
  onNavigate,
}: {
  section: Section;
  activeLessonId: string | undefined;
  onNavigate: () => void;
}) {
  const { state, isMobile } = useSidebar();
  const [open, setOpen] = useState(true);
  // The icon rail hides Section headings, so a closed Section would leave its
  // Lessons unreachable there. Show them all while the rail is collapsed.
  const isIconRail = state === 'collapsed' && !isMobile;

  return (
    <Collapsible
      open={open || isIconRail}
      onOpenChange={setOpen}
      className='group/section'>
      <SidebarGroup>
        <SidebarGroupLabel
          asChild
          className='hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'>
          <CollapsibleTrigger>
            {section.title}
            <ChevronDownIcon className='ml-auto transition-transform group-data-[state=closed]/section:-rotate-90' />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.lessons.map((lesson) => (
                <SidebarMenuItem key={lesson.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeLessonId === lesson.id}
                    tooltip={lesson.title}>
                    <NavLink to={`/lessons/${lesson.id}`} onClick={onNavigate}>
                      <BookOpenIcon />
                      <span>{lesson.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{lesson.questions.length}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
