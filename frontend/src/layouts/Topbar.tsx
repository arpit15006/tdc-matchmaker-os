import { LogOut, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/auth/AuthContext';

export function Topbar() {
  const { matchmaker, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/customers?q=${encodeURIComponent(q.trim())}`);
  };

  const nameParts = (matchmaker?.name ?? 'TDC Matchmaker').split(' ');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-line bg-background/80 px-6 backdrop-blur">
      <form onSubmit={onSearch} className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search clients by name, city, company…"
          aria-label="Global client search"
          className="h-10 w-full rounded-2xl border border-line bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted transition-all duration-200 focus:border-rose focus:outline-none focus:ring-4 focus:ring-rose/10"
        />
      </form>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-ink">{matchmaker?.name}</p>
          <p className="text-xs text-ink-muted">Matchmaker</p>
        </div>
        <Avatar firstName={nameParts[0] ?? 'T'} lastName={nameParts[1] ?? 'M'} size="sm" />
        <button
          onClick={logout}
          aria-label="Sign out"
          title="Sign out"
          className="rounded-2xl p-2 text-ink-muted transition-colors hover:bg-rose-soft/40 hover:text-rose-deep cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
