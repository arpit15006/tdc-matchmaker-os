import { cn } from '@/lib/utils/cn';

function Bar({ className }: { className?: string }) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-lg bg-line/70', className)}
      aria-hidden
    />
  );
}

export function KPISkeleton() {
  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft" aria-busy>
      <Bar className="h-4 w-24" />
      <Bar className="mt-4 h-8 w-16" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft" aria-busy>
      <div className="flex items-center gap-4">
        <Bar className="h-14 w-14 rounded-full" />
        <div className="flex-1">
          <Bar className="h-4 w-1/2" />
          <Bar className="mt-2 h-3 w-1/3" />
        </div>
        <Bar className="h-16 w-16 rounded-full" />
      </div>
      <Bar className="mt-4 h-3 w-full" />
      <Bar className="mt-2 h-3 w-4/5" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-line px-4 py-4" aria-busy>
      <Bar className="h-10 w-10 rounded-full" />
      <Bar className="h-4 flex-1" />
      <Bar className="h-4 w-16" />
      <Bar className="h-4 w-24" />
      <Bar className="h-4 w-20" />
    </div>
  );
}

export function FunnelSkeleton() {
  return (
    <div className="space-y-2 p-2" aria-busy>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Bar className="h-6 w-6 shrink-0 rounded-full" />
          <Bar className="h-4 w-24 shrink-0" />
          <Bar className="h-8 flex-1 rounded-lg" />
          <Bar className="h-4 w-8 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-5" aria-busy>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Bar className="h-9 w-9 rounded-full" />
          <div className="flex-1">
            <Bar className="h-4 w-1/3" />
            <Bar className="mt-2 h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LineSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2" aria-busy>
      {Array.from({ length: lines }).map((_, i) => (
        <Bar key={i} className={cn('h-3', i === lines - 1 ? 'w-3/5' : 'w-full')} />
      ))}
    </div>
  );
}
