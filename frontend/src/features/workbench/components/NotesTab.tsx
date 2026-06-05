import { motion } from 'framer-motion';
import { Plus, StickyNote } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LineSkeleton } from '@/components/feedback/Skeletons';
import { apiErrorMessage } from '@/lib/api/axios';
import { dateTime, humanize } from '@/lib/format';
import { staggerContainer, staggerItem } from '@/lib/motion/variants';
import type { NoteCategory } from '@/types';
import { useCreateNote, useNotes } from '../api/workbenchApi';

const CATEGORIES = [
  { value: 'GENERAL', label: 'General' },
  { value: 'PREFERENCE', label: 'Preference' },
  { value: 'CONCERN', label: 'Concern' },
  { value: 'CALL_LOG', label: 'Call log' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'FEEDBACK', label: 'Feedback' },
  { value: 'STRATEGY', label: 'Strategy' },
];

const CATEGORY_TONE: Record<string, 'neutral' | 'rose' | 'gold' | 'sage'> = {
  GENERAL: 'neutral',
  PREFERENCE: 'gold',
  CONCERN: 'rose',
  CALL_LOG: 'neutral',
  FAMILY: 'sage',
  FEEDBACK: 'gold',
  STRATEGY: 'sage',
};

export function NotesTab({ customerId }: { customerId: string }) {
  const { toast } = useToast();
  const notes = useNotes(customerId);
  const createNote = useCreateNote(customerId);
  const [category, setCategory] = useState<NoteCategory>('GENERAL');
  const [content, setContent] = useState('');

  const submit = () => {
    if (!content.trim()) return;
    createNote.mutate(
      { category, content: content.trim() },
      {
        onSuccess: () => {
          setContent('');
          setCategory('GENERAL');
          toast('Note added', 'success');
        },
        onError: (e) => toast(apiErrorMessage(e, 'Could not save note'), 'error'),
      }
    );
  };

  return (
    <div className="space-y-5">
      {/* Composer */}
      <Card>
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="sm:w-48">
              <Select
                aria-label="Note category"
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                options={CATEGORIES}
              />
            </div>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Capture an observation, preference, or coaching insight…"
            rows={3}
            aria-label="Note content"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              loading={createNote.isPending}
              disabled={!content.trim()}
              onClick={submit}
            >
              Add Note
            </Button>
          </div>
        </div>
      </Card>

      {/* Notes list */}
      {notes.isLoading ? (
        <Card>
          <LineSkeleton lines={4} />
        </Card>
      ) : !notes.data?.length ? (
        <EmptyState
          icon={<StickyNote className="h-6 w-6" />}
          title="No notes yet"
          description="Capture your first impression — it builds the client's story over time."
        />
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
          {notes.data.map((note) => (
            <motion.div key={note.id} variants={staggerItem}>
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar firstName={note.author.name.split(' ')[0]} lastName={note.author.name.split(' ').slice(-1)[0]} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{note.author.name}</span>
                      <Badge tone={CATEGORY_TONE[note.category]}>{humanize(note.category)}</Badge>
                      <span className="ml-auto text-xs text-ink-muted">{dateTime(note.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{note.content}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
