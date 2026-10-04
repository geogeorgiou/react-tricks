import { NavLink, useMatch } from 'react-router';
import { AtomIcon, BookOpenIcon, LayoutGridIcon } from 'lucide-react';
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
import { lessons } from '@/features/lessons/registry';
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

        <SidebarGroup>
          <SidebarGroupLabel>Lessons</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {lessons.map((lesson) => (
                <SidebarMenuItem key={lesson.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={lessonMatch?.params.lessonId === lesson.id}
                    tooltip={lesson.title}>
                    <NavLink
                      to={`/lessons/${lesson.id}`}
                      onClick={closeOnMobile}>
                      <BookOpenIcon />
                      <span>{lesson.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{lesson.variants.length}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
