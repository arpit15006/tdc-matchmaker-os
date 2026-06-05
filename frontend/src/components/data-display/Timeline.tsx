import { motion } from 'framer-motion';
import {
  CalendarCheck,
  FileText,
  Heart,
  MessageCircle,
  Send,
  Sparkles,
  StickyNote,
  UserPlus,
  Workflow,
  BadgeCheck,
} from 'lucide-react';
import { dateTime } from '@/lib/format';
import { staggerContainer, staggerItem } from '@/lib/motion/variants';
import type { TimelineEvent, TimelineEventType } from '@/types';

const ICONS: Record<TimelineEventType, React.ReactNode> = {
  PROFILE_CREATED: <UserPlus className="h-4 w-4" />,
  VERIFICATION: <BadgeCheck className="h-4 w-4" />,
  STAGE_CHANGE: <Workflow className="h-4 w-4" />,
  NOTE_ADDED: <StickyNote className="h-4 w-4" />,
  MATCH_GENERATED: <Sparkles className="h-4 w-4" />,
  INTRODUCTION_SENT: <Send className="h-4 w-4" />,
  FEEDBACK_RECEIVED: <MessageCircle className="h-4 w-4" />,
  CALL_SCHEDULED: <CalendarCheck className="h-4 w-4" />,
  STATUS_UPDATE: <FileText className="h-4 w-4" />,
};

const TONE: Record<TimelineEventType, string> = {
  PROFILE_CREATED: 'bg-rose-soft text-rose-deep',
  VERIFICATION: 'bg-sage-soft text-sage-deep',
  STAGE_CHANGE: 'bg-gold-soft text-gold-deep',
  NOTE_ADDED: 'bg-line text-ink-soft',
  MATCH_GENERATED: 'bg-gold-soft text-gold-deep',
  INTRODUCTION_SENT: 'bg-rose-soft text-rose-deep',
  FEEDBACK_RECEIVED: 'bg-sage-soft text-sage-deep',
  CALL_SCHEDULED: 'bg-gold-soft text-gold-deep',
  STATUS_UPDATE: 'bg-line text-ink-soft',
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <motion.ol variants={staggerContainer} initial="initial" animate="animate" className="relative space-y-1">
      {events.map((event, i) => (
        <motion.li key={event.id} variants={staggerItem} className="relative flex gap-4 pb-5">
          {/* Connector line */}
          {i < events.length - 1 && (
            <span className="absolute left-[18px] top-10 h-[calc(100%-1.5rem)] w-px bg-line" aria-hidden />
          )}
          <span
            className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONE[event.type]}`}
          >
            {ICONS[event.type] ?? <Heart className="h-4 w-4" />}
          </span>
          <div className="pt-0.5">
            <p className="text-sm text-ink">{event.description}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{dateTime(event.createdAt)}</p>
          </div>
        </motion.li>
      ))}
    </motion.ol>
  );
}
