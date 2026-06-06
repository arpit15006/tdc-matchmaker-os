import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Clock, Heart, History, Sparkles, StickyNote, User } from 'lucide-react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';
import { StageBadge } from '@/components/data-display/StageBadge';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { ErrorState } from '@/components/feedback/ErrorState';
import { CardSkeleton } from '@/components/feedback/Skeletons';
import { apiErrorMessage } from '@/lib/api/axios';
import { relativeDate } from '@/lib/format';
import { STAGE_OPTIONS } from '@/lib/stages';
import { useCustomer } from '@/features/customers/api/useCustomers';
import { useUpdateStage } from '../api/workbenchApi';
import { InsightsPanel } from '../components/InsightsPanel';
import { MatchesTab } from '../components/MatchesTab';
import { NotesTab } from '../components/NotesTab';
import { ProfileTab } from '../components/ProfileTab';
import { TimelineTab } from '../components/TimelineTab';

const TABS = [
  { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  { id: 'matches', label: 'Matches', icon: <Heart className="h-4 w-4" /> },
  { id: 'notes', label: 'Notes', icon: <StickyNote className="h-4 w-4" /> },
  { id: 'timeline', label: 'Timeline', icon: <History className="h-4 w-4" /> },
];

export function WorkbenchPage() {
  const { customerId = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'profile';

  const { data: customer, isLoading, isError, refetch } = useCustomer(customerId);
  const updateStage = useUpdateStage(customerId);

  const setTab = (id: string) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', id);
      return next;
    });
  };

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading || !customer) {
    return (
      <div className="space-y-5">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/customers')}
        className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to clients
      </button>

      {/* Header */}
      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar firstName={customer.firstName} lastName={customer.lastName} gender={customer.gender} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-2xl text-ink">
                {customer.firstName} {customer.lastName}
              </h1>
              <VerifiedBadge verified={customer.verified} size="md" />
              <StageBadge stage={customer.currentStage} />
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              {customer.age} · {customer.city} · {customer.designation} at {customer.currentCompany}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
              <Clock className="h-3.5 w-3.5" />
              Last activity {relativeDate(customer.lastInteractionDate)}
            </p>
          </div>
          <div className="sm:w-52">
            <Select
              aria-label="Update journey stage"
              value={customer.currentStage}
              options={STAGE_OPTIONS}
              onChange={(e) =>
                updateStage.mutate(e.target.value, {
                  onSuccess: () => toast('Stage updated', 'success'),
                  onError: (err) => toast(apiErrorMessage(err), 'error'),
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* Two-column: tabs + AI insights rail */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <div className="mt-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'profile' && <ProfileTab customer={customer} />}
                {tab === 'matches' && <MatchesTab customerId={customerId} />}
                {tab === 'notes' && <NotesTab customerId={customerId} />}
                {tab === 'timeline' && <TimelineTab customerId={customerId} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-1">
          <div className="mb-2 flex items-center gap-2 text-sm text-ink-soft lg:hidden">
            <Sparkles className="h-4 w-4 text-gold-deep" /> AI Insights
          </div>
          <InsightsPanel customerId={customerId} />
        </div>
      </div>
    </div>
  );
}
