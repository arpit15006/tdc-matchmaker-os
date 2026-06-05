import { History } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Timeline } from '@/components/data-display/Timeline';
import { EmptyState } from '@/components/feedback/EmptyState';
import { TimelineSkeleton } from '@/components/feedback/Skeletons';
import { useTimeline } from '../api/workbenchApi';

export function TimelineTab({ customerId }: { customerId: string }) {
  const timeline = useTimeline(customerId);

  return (
    <Card>
      {timeline.isLoading ? (
        <TimelineSkeleton />
      ) : !timeline.data?.length ? (
        <EmptyState
          icon={<History className="h-6 w-6" />}
          title="No journey events yet"
          description="As you work with this client, every milestone will appear here."
        />
      ) : (
        <Timeline events={timeline.data} />
      )}
    </Card>
  );
}
