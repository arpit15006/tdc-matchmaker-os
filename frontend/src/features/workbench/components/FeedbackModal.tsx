import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { apiErrorMessage } from '@/lib/api/axios';
import type { FeedbackReason, FeedbackResponse, Match } from '@/types';
import { useSubmitFeedback } from '../api/workbenchApi';

const RESPONSES = [
  { value: 'INTERESTED', label: 'Interested' },
  { value: 'NOT_INTERESTED', label: 'Not interested' },
  { value: 'NEED_MORE_TIME', label: 'Need more time' },
  { value: 'DATE_SCHEDULED', label: 'Date scheduled' },
  { value: 'FOLLOW_UP_NEEDED', label: 'Follow-up needed' },
];

const REASONS = [
  { value: 'LOCATION_MISMATCH', label: 'Location mismatch' },
  { value: 'LIFESTYLE_MISMATCH', label: 'Lifestyle mismatch' },
  { value: 'TIMING', label: 'Timing issues' },
  { value: 'FAMILY_CONCERNS', label: 'Family concerns' },
  { value: 'NO_CHEMISTRY', label: 'No chemistry' },
  { value: 'OTHER', label: 'Other' },
];

interface Props {
  customerId: string;
  match: Match | null;
  open: boolean;
  onClose: () => void;
}

export function FeedbackModal({ customerId, match, open, onClose }: Props) {
  const { toast } = useToast();
  const submit = useSubmitFeedback(customerId);
  const [response, setResponse] = useState<FeedbackResponse>('INTERESTED');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState('');

  if (!match) return null;

  const handleSubmit = () => {
    submit.mutate(
      {
        matchId: match.id,
        response,
        reason: reason ? (reason as FeedbackReason) : undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          toast('Feedback recorded', 'success');
          setNotes('');
          setReason('');
          onClose();
        },
        onError: (e) => toast(apiErrorMessage(e, 'Could not save feedback'), 'error'),
      }
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record feedback"
      description={`On the match with ${match.candidate.firstName} ${match.candidate.lastName}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={submit.isPending} onClick={handleSubmit}>
            Save feedback
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Select
          label="Client's response"
          value={response}
          onChange={(e) => setResponse(e.target.value as FeedbackResponse)}
          options={RESPONSES}
        />
        <Select
          label="Reason (optional)"
          placeholder="No specific reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={REASONS}
        />
        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any context from the conversation…"
        />
      </div>
    </Modal>
  );
}
