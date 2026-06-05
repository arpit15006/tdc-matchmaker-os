import { Heart, Inbox, LayoutGrid, Sparkles, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/customers', label: 'Clients', icon: Users },
  { to: '/queue', label: 'Match Queue', icon: Inbox },
  { to: '/success', label: 'Success Stories', icon: Sparkles },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface/70 px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2 px-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-soft text-rose-deep">
          <Heart className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="font-serif text-base text-ink">The Date Crew</p>
          <p className="text-xs text-ink-muted">Matchmaker OS</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-rose-soft/50 text-ink'
                  : 'text-ink-soft hover:bg-rose-soft/30 hover:text-ink'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 -translate-y-1/2 w-1 rounded-r-full bg-gold" />
                )}
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <p className="mt-auto px-3 text-xs text-ink-muted">
        Human expertise, enhanced by AI.
      </p>
    </aside>
  );
}
