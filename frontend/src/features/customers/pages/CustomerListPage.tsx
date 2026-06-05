import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { StageBadge } from '@/components/data-display/StageBadge';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { TableRowSkeleton } from '@/components/feedback/Skeletons';
import { relativeDate } from '@/lib/format';
import { staggerContainer, staggerItem } from '@/lib/motion/variants';
import { cn } from '@/lib/utils/cn';
import { useCustomers } from '../api/useCustomers';
import { CustomerFilters } from '../components/CustomerFilters';
import { useCustomerFilters } from '../hooks/useCustomerFilters';

const COLUMNS: { key: string; label: string; sortable?: boolean; className?: string }[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'age', label: 'Age', sortable: true, className: 'w-16' },
  { key: 'city', label: 'City' },
  { key: 'profession', label: 'Profession' },
  { key: 'marital', label: 'Marital' },
  { key: 'stage', label: 'Stage', sortable: true },
  { key: 'lastInteraction', label: 'Last Activity', sortable: true },
  { key: 'activityScore', label: 'Activity', sortable: true, className: 'w-24' },
];

function ActivityMeter({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-gold"
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
      <span className="text-xs text-ink-muted">{score}</span>
    </div>
  );
}

export function CustomerListPage() {
  const navigate = useNavigate();
  const filterApi = useCustomerFilters();
  const { filters, setSort, setPage } = filterApi;
  const { data, isLoading, isError, refetch } = useCustomers(filters);

  const sortIcon = (key: string) => {
    if (filters.sort !== key) return null;
    return filters.order === 'asc' ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Roster"
        title="Clients"
        subtitle={
          data ? `${data.pagination.total} clients across every stage of the journey` : 'Your client roster'
        }
      />

      <CustomerFilters {...filterApi} />

      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
        {/* Header */}
        <div className="hidden grid-cols-[2fr_0.5fr_1fr_1.5fr_1fr_1.2fr_1.2fr_1fr] gap-4 border-b border-line px-5 py-3 text-xs font-medium uppercase tracking-wide text-ink-muted lg:grid">
          {COLUMNS.map((c) => (
            <button
              key={c.key}
              disabled={!c.sortable}
              onClick={() => c.sortable && setSort(c.key)}
              className={cn(
                'flex items-center gap-1 text-left',
                c.sortable && 'cursor-pointer hover:text-ink'
              )}
            >
              {c.label}
              {sortIcon(c.key)}
            </button>
          ))}
        </div>

        {isError ? (
          <div className="p-6">
            <ErrorState onRetry={() => refetch()} />
          </div>
        ) : isLoading || !data ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </div>
        ) : data.data.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No clients match these filters"
              description="Try adjusting or clearing your filters to see more of your roster."
            />
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            {data.data.map((c) => (
              <motion.button
                key={c.id}
                variants={staggerItem}
                onClick={() => navigate(`/customers/${c.id}`)}
                className="grid w-full grid-cols-2 items-center gap-4 border-b border-line px-5 py-4 text-left transition-colors last:border-0 hover:bg-rose-soft/20 lg:grid-cols-[2fr_0.5fr_1fr_1.5fr_1fr_1.2fr_1.2fr_1fr]"
              >
                <div className="col-span-2 flex items-center gap-3 lg:col-span-1">
                  <Avatar firstName={c.firstName} lastName={c.lastName} gender={c.gender} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-ink">
                        {c.firstName} {c.lastName}
                      </span>
                      {c.verified && <VerifiedBadge verified showLabel={false} />}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 lg:hidden">
                      <span className="text-xs text-ink-muted">
                        {c.age} · {c.city} · {c.designation}
                      </span>
                      <StageBadge stage={c.currentStage} />
                    </div>
                  </div>
                </div>
                <span className="hidden text-sm text-ink-soft lg:block">{c.age}</span>
                <span className="hidden truncate text-sm text-ink-soft lg:block">{c.city}</span>
                <span className="hidden truncate text-sm text-ink-soft lg:block">{c.designation}</span>
                <span className="hidden truncate text-sm text-ink-soft lg:block">
                  {c.maritalStatus.replace(/_/g, ' ').toLowerCase()}
                </span>
                <span className="hidden lg:block">
                  <StageBadge stage={c.currentStage} />
                </span>
                <span className="hidden whitespace-nowrap text-sm text-ink-muted lg:block">
                  {relativeDate(c.lastInteractionDate)}
                </span>
                <span className="hidden lg:block">
                  <ActivityMeter score={c.matchActivityScore} />
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={data.pagination.page <= 1}
              onClick={() => setPage(data.pagination.page - 1)}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={data.pagination.page >= data.pagination.totalPages}
              onClick={() => setPage(data.pagination.page + 1)}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
