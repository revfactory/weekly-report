import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/sidebar';
import { Menu } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

export function AppShell() {
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-accent">WeekPulse</span>
        </div>
        <div className="mx-auto max-w-[960px] p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
