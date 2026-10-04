import { Outlet } from 'react-router';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SearchDialog } from '@/features/search/search-dialog';
import { AppSidebar } from './app-sidebar';

export function AppLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className='sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <span className='text-sm text-muted-foreground'>
              React interview trick questions
            </span>
            <SearchDialog />
          </header>
          <div className='mx-auto w-full max-w-7xl flex-1 p-4 md:p-6'>
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
