
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Skeleton } from '../ui/skeleton';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen">
        <Skeleton className="hidden md:block w-64 h-full" />
        <div className="flex-1 p-8">
            <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="flex flex-col">
            <SidebarNav user={user} />
        </Sidebar>
        <SidebarInset className="bg-gray-50 dark:bg-gray-900/50 flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          <footer className="p-4 text-center text-sm text-muted-foreground">
            © 2025 AttenEase Attendance. All rights reserved.
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
