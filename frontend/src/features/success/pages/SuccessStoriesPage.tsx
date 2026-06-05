import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CalendarHeart, Gem, Heart, Sparkles, TrendingUp, UserCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { KPIStat } from '@/components/data-display/KPIStat';
import { StageBadge } from '@/components/data-display/StageBadge';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { KPISkeleton } from '@/components/feedback/Skeletons';
import { api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/queryKeys';
import { staggerContainer, staggerItem } from '@/lib/motion/variants';
import type { SuccessStories } from '@/types';

function useSuccess() {
  return useQuery({
    queryKey: queryKeys.success,
    queryFn: async () => (await api.get<SuccessStories>('/success-stories')).data,
  });
}

export function SuccessStoriesPage() {
  const { data, isLoading, isError, refetch } = useSuccess();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Outcomes"
        title="Success Stories"
        subtitle="The relationships your work has helped create."
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KPISkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            <KPIStat label="Relationships" value={data.relationships} icon={<Heart className="h-5 w-5" />} accent="sage" />
            <KPIStat label="Engagements" value={data.engagements} icon={<Gem className="h-5 w-5" />} accent="gold" />
            <KPIStat label="Marriages" value={data.marriages} icon={<UserCheck className="h-5 w-5" />} accent="rose" />
            <KPIStat label="Avg. Time to Match" value={data.avgDaysToMatch} suffix=" days" icon={<CalendarHeart className="h-5 w-5" />} accent="plum" />
          </motion.div>

          <div className="space-y-6">
            <Card className="flex flex-col items-center text-center">
              <h3 className="self-start font-serif text-lg text-ink">Success Rate</h3>
              <div className="my-6">
                <ProgressRing value={data.successRate} size={150} stroke={14} gradient={['#8FA68E', '#6E8A6D']}>
                  <div className="text-center">
                    <span className="font-serif text-5xl text-ink">{data.successRate}</span>
                    <span className="text-2xl text-ink-soft">%</span>
                  </div>
                </ProgressRing>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-sage-deep">
                <TrendingUp className="h-4 w-4" /> Of introduced clients
              </p>
            </Card>

            <div>
              {data.stories.length === 0 ? (
                <EmptyState
                  icon={<Sparkles className="h-6 w-6" />}
                  title="Success stories will be celebrated here"
                  description="As clients reach relationships, engagements, and marriages, they'll appear here."
                />
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid gap-4 sm:grid-cols-2"
                >
                  {data.stories.map((s, i) => (
                    <motion.div key={s.client.id + i} variants={staggerItem}>
                      <Card className="h-full">
                        <div className="flex items-center justify-between">
                          <StageBadge stage={s.stage} />
                          {s.score != null && <Badge tone="gold">{s.score}/100</Badge>}
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-3">
                          <Avatar firstName={s.client.firstName} lastName={s.client.lastName} gender={s.client.gender} />
                          <Heart className="h-5 w-5 text-rose" />
                          {s.partner ? (
                            <Avatar
                              firstName={s.partner.firstName}
                              lastName={s.partner.lastName}
                              gender={s.partner.gender}
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-line text-ink-muted">
                              ?
                            </div>
                          )}
                        </div>
                        <p className="mt-3 text-center font-serif text-ink">
                          {s.client.firstName}
                          {s.partner ? ` & ${s.partner.firstName}` : ''}
                        </p>
                        <p className="mt-0.5 text-center text-xs text-ink-muted">
                          {s.client.city}
                          {s.partner && s.partner.city !== s.client.city ? ` · ${s.partner.city}` : ''}
                        </p>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
