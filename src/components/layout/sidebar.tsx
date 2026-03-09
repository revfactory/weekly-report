import { NavLink } from 'react-router-dom';
import { PenLine, List, BarChart3, FileText, Settings, Moon, Sun, X, Github } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: PenLine, label: '보고 작성', path: '/write' },
  { icon: List, label: '보고 목록', path: '/list' },
  { icon: BarChart3, label: '대시보드', path: '/dashboard' },
  { icon: FileText, label: '리포트', path: '/reports' },
];

function NavItem({ icon: Icon, label, path, onClick }: { icon: typeof PenLine; label: string; path: string; onClick?: () => void }) {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-100',
          isActive
            ? 'bg-accent/10 text-accent border-l-[3px] border-accent'
            : 'text-text-secondary hover:bg-surface hover:text-text-primary',
        )
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const closeMobile = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'flex h-full w-60 flex-col border-r border-border bg-sidebar shrink-0 transition-transform duration-200',
          // Mobile: fixed overlay drawer
          'fixed z-50 md:relative md:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5">
          <h1 className="text-xl font-bold text-accent">WeekPulse</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-text-muted hover:text-text-primary md:hidden cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map(({ icon, label, path }) => (
            <NavItem key={path} icon={icon} label={label} path={path} onClick={closeMobile} />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-3 py-3">
          <NavItem icon={Settings} label="설정" path="/settings" onClick={closeMobile} />
          <button
            onClick={toggleTheme}
            className="flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? '라이트 모드' : '다크 모드'}</span>
          </button>
          <a
            href="https://github.com/revfactory/weekly-report"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
          >
            <Github size={18} />
            <span>GitHub</span>
          </a>
        </div>
      </aside>
    </>
  );
}
