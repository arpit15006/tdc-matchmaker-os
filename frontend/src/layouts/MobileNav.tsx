import { Inbox, LayoutGrid, Sparkles, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';

// Same destinations as the desktop Sidebar, with short labels for the tab bar.
const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/customers', label: 'Clients', icon: Users },
  { to: '/queue', label: 'Queue', icon: Inbox },
  { to: '/success', label: 'Stories', icon: Sparkles },
];

/**
 * Bottom tab bar — mobile/tablet only (hidden at `lg`, where the Sidebar takes over).
 * Fixed to the viewport bottom with a safe-area inset for notched phones.
 */
export function MobileNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
              isActive ? 'text-rose-deep' : 'text-ink-muted'
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
