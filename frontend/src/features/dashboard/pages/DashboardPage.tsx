import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Gem,
  Heart,
  HeartHandshake,
  Send,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { FunnelChart } from '@/components/data-display/FunnelChart';
import { KPIStat } from '@/components/data-display/KPIStat';
import { ErrorState } from '@/components/feedback/ErrorState';
import { FunnelSkeleton, KPISkeleton } from '@/components/feedback/Skeletons';
import { useAuth } from '@/lib/auth/AuthContext';
import { staggerContainer } from '@/lib/motion/variants';
import { useDashboardKpis, useFunnel } from '../api/useDashboard';

export function DashboardPage() {
  const { matchmaker } = useAuth();
  const kpis = useDashboardKpis();
  const funnel = useFunnel();
  const firstName = matchmaker?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="The Date Crew · Matchmaker OS"
        title={`Good to see you, ${firstName}`}
        subtitle="A premium view of your matchmaking practice — clients, pipeline, and outcomes at a glance."
      />

      {/* KPI grid */}
      {kpis.isError ? (
        <ErrorState onRetry={() => kpis.refetch()} />
      ) : kpis.isLoading || !kpis.data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <KPISkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4"
        >
          <KPIStat label="Total Clients" value={kpis.data.totalClients} icon={<Users className="h-5 w-5" />} accent="plum" />
          <KPIStat label="Active Searches" value={kpis.data.activeSearches} icon={<Sparkles className="h-5 w-5" />} accent="rose" />
          <KPIStat label="Matches Sent" value={kpis.data.matchesSent} icon={<Send className="h-5 w-5" />} accent="rose" />
          <KPIStat label="Introductions" value={kpis.data.introductionsSent} icon={<HeartHandshake className="h-5 w-5" />} accent="gold" />
          <KPIStat label="Meetings Scheduled" value={kpis.data.meetingsScheduled} icon={<CalendarCheck className="h-5 w-5" />} accent="gold" />
          <KPIStat label="Relationships" value={kpis.data.relationships} icon={<Heart className="h-5 w-5" />} accent="sage" />
          <KPIStat label="Engagements" value={kpis.data.engagements} icon={<Gem className="h-5 w-5" />} accent="sage" />
          <KPIStat label="Marriages" value={kpis.data.marriages} icon={<UserCheck className="h-5 w-5" />} accent="sage" />
        </motion.div>
      )}

      {/* Funnel + success rate */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Matchmaking Funnel</CardTitle>
            <CardSubtitle>The journey from first review to marriage</CardSubtitle>
          </CardHeader>
          {funnel.isError ? (
            <ErrorState onRetry={() => funnel.refetch()} />
          ) : funnel.isLoading || !funnel.data ? (
            <FunnelSkeleton />
          ) : (
            <FunnelChart stages={funnel.data} />
          )}
        </Card>

        <Card className="flex flex-col items-center self-start text-center">
          <CardTitle className="self-start">Success Rate</CardTitle>
          <CardSubtitle className="self-start">Of clients past introduction</CardSubtitle>
          <div className="my-6">
            <ProgressRing value={kpis.data?.successRate ?? 0} size={140} stroke={12} gradient={['#8FA68E', '#6E8A6D']}>
              <div className="text-center">
                <span className="font-serif text-4xl text-ink">{kpis.data?.successRate ?? 0}</span>
                <span className="text-xl text-ink-soft">%</span>
              </div>
            </ProgressRing>
          </div>
          <div className="flex items-center gap-2 text-sm text-sage-deep">
            <TrendingUp className="h-4 w-4" />
            Reaching meaningful relationships
          </div>
        </Card>
      </div>
    </div>
  );
}
