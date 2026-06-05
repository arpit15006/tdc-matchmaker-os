import { motion } from 'framer-motion';
import { CheckCircle2, Send, Sparkles, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { LineSkeleton } from '@/components/feedback/Skeletons';
import { apiErrorMessage } from '@/lib/api/axios';
import type { IntroductionVariants, Match } from '@/types';
import { useGenerateIntroduction, useSendMatch } from '../api/workbenchApi';

type Step = 'generate' | 'preview' | 'success';
type Tone = keyof IntroductionVariants;

const TONE_OPTIONS = [
  { value: 'warm', label: 'Warm' },
  { value: 'professional', label: 'Professional' },
  { value: 'personalized', label: 'Personalized' },
];

interface Props {
  customerId: string;
  match: Match | null;
  open: boolean;
  onClose: () => void;
}

export function SendMatchModal({ customerId, match, open, onClose }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('generate');
  const [tone, setTone] = useState<Tone>('warm');
  const [variants, setVariants] = useState<IntroductionVariants | null>(null);
  const [draft, setDraft] = useState('');

  const generate = useGenerateIntroduction();
  const send = useSendMatch(customerId);

  // Reset when (re)opened.
  useEffect(() => {
    if (open && match) {
      setStep('generate');
      setTone('warm');
      setVariants(null);
      setDraft('');
      generate.mutate(match.id, {
        onSuccess: (data) => {
          setVariants(data.variants);
          setDraft(data.variants.warm);
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, match?.id]);

  if (!match) return null;
  const candidate = match.candidate;

  const onToneChange = (t: string) => {
    setTone(t as Tone);
    if (variants) setDraft(variants[t as Tone]);
  };

  const handleSend = () => {
    send.mutate(
      { matchId: match.id, introduction: draft, tone },
      {
        onSuccess: () => {
          setStep('success');
          toast('Introduction sent — timeline updated', 'success');
        },
        onError: (e) => toast(apiErrorMessage(e, 'Could not send'), 'error'),
      }
    );
  };

  const steps: { key: Step; label: string }[] = [
    { key: 'generate', label: 'Compose' },
    { key: 'preview', label: 'Preview' },
    { key: 'success', label: 'Sent' },
  ];

  const footer = (
    <div className="flex justify-end gap-2">
      {step === 'generate' && (
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={generate.isPending || !draft}
            rightIcon={<Wand2 className="h-4 w-4" />}
            onClick={() => setStep('preview')}
          >
            Preview
          </Button>
        </>
      )}
      {step === 'preview' && (
        <>
          <Button variant="ghost" onClick={() => setStep('generate')}>
            Back
          </Button>
          <Button loading={send.isPending} leftIcon={<Send className="h-4 w-4" />} onClick={handleSend}>
            Send Match
          </Button>
        </>
      )}
      {step === 'success' && <Button onClick={onClose}>Done</Button>}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Introduce ${candidate.firstName} ${candidate.lastName}`}
      description={`Match score ${match.overallScore}/100 · ${candidate.city}`}
      size="lg"
      footer={footer}
    >
      {/* Stepper */}
      <div className="mb-6 flex items-center gap-2">
        {steps.map((s, i) => {
          const activeIdx = steps.findIndex((x) => x.key === step);
          const done = i < activeIdx;
          const current = s.key === step;
          return (
            <div key={s.key} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  done
                    ? 'bg-sage text-white'
                    : current
                      ? 'bg-gold text-white'
                      : 'bg-line text-ink-muted'
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </span>
              <span className={`text-xs ${current ? 'text-ink' : 'text-ink-muted'}`}>{s.label}</span>
              {i < steps.length - 1 && <span className="h-px flex-1 bg-line" />}
            </div>
          );
        })}
      </div>

      <motion.div
        key={step === 'success' ? 'success' : 'compose'}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        {step === 'success' ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-soft text-sage-deep">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-serif text-xl text-ink">Introduction sent</h3>
            <p className="mt-2 max-w-sm text-sm text-ink-muted">
              The client's timeline and match queue have been updated.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <Sparkles className="h-4 w-4 text-gold-deep" />
              Choose a tone — drafted live by Llama 3.3 70B
            </div>
            <SegmentedControl options={TONE_OPTIONS} value={tone} onChange={onToneChange} />

            {generate.isPending ? (
              <div className="rounded-2xl border border-line bg-background/50 p-4">
                <LineSkeleton lines={5} />
              </div>
            ) : generate.isError ? (
              <div className="rounded-2xl bg-rose-soft/40 p-4 text-sm text-rose-deep">
                {apiErrorMessage(generate.error, 'Could not draft an introduction.')}
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => match && generate.mutate(match.id, { onSuccess: (d) => { setVariants(d.variants); setDraft(d.variants[tone]); } })}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <Textarea
                label="Introduction message"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={8}
              />
            )}
          </div>
        )}
      </motion.div>
    </Modal>
  );
}
