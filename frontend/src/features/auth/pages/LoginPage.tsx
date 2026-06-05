import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, Heart, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiErrorMessage } from '@/lib/api/axios';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLogin } from '../api/useLogin';

interface FormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState } = useForm<FormValues>({
    defaultValues: { email: '', password: '' },
  });

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await loginMutation.mutateAsync(values);
      login(result.token, result.matchmaker);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Unable to sign in'));
    }
  });

  const fillDemo = () => {
    setValue('email', 'matchmaker@tdc.com');
    setValue('password', 'password123');
  };

  const stats = [
    { k: '200+', v: 'Curated profiles' },
    { k: '12', v: 'Compatibility signals' },
    { k: 'AI', v: 'Match insights' },
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Left editorial panel — deep warm-plum canvas */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 text-[#FBF7F4] lg:flex bg-[radial-gradient(135%_135%_at_12%_8%,#4C3743_0%,#3A262C_42%,#24141A_100%)]">
        {/* Floating ambient orbs */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-rose/30 blur-[110px]"
          animate={{ y: [0, 18, 0], x: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-gold/25 blur-[120px]"
          animate={{ y: [0, -16, 0], x: [0, 12, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Hairline frame + soft vignette */}
        <div aria-hidden className="pointer-events-none absolute inset-5 rounded-[2rem] border border-white/10" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_120%,rgba(0,0,0,0.35),transparent_60%)]" />

        <div className="relative z-10 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#F3D9A6] shadow-soft ring-1 ring-inset ring-white/15 backdrop-blur">
            <Heart className="h-5 w-5" />
          </span>
          <span className="font-serif text-lg tracking-wide">The Date Crew</span>
        </div>

        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#E8C77E]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Matchmaker Operating System
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-[3.4rem] leading-[1.06] text-[#FBF7F4]"
          >
            Where thoughtful{' '}
            <span className="bg-[linear-gradient(120deg,#F3D9A6,#E8C77E_55%,#E7B4A6)] bg-clip-text text-transparent">
              matches
            </span>{' '}
            begin.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 max-w-md text-[15px] leading-relaxed text-white/70"
          >
            Crafted for long-term compatibility — guided by human expertise and enhanced by AI.
          </motion.p>

          <div className="mt-9 h-px w-full max-w-md bg-gradient-to-r from-white/20 via-white/10 to-transparent" />

          <div className="mt-7 flex items-center gap-6">
            {stats.map((s, i) => (
              <Fragment key={s.v}>
                {i > 0 && <span aria-hidden className="h-9 w-px bg-white/15" />}
                <div>
                  <p className="font-serif text-3xl text-[#F3D9A6]">{s.k}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-white/55">{s.v}</p>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        <p className="relative z-10 flex items-center gap-2 text-sm text-white/55">
          <ShieldCheck className="h-4 w-4 text-[#E8C77E]" />
          Premium concierge matchmaking · Internal tool
        </p>
      </div>

      {/* Right form panel */}
      <div className="relative flex items-center justify-center overflow-hidden bg-ambient p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-surface p-8 shadow-float"
        >
          {/* Gold top accent hairline */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,transparent,#E8C77E_30%,#C2848B_70%,transparent)]" />

          <div className="mb-7 lg:hidden">
            <div className="flex items-center gap-2 text-ink">
              <Heart className="h-5 w-5 text-rose" />
              <span className="font-serif text-lg">The Date Crew</span>
            </div>
          </div>
          <h2 className="font-serif text-2xl text-ink">Welcome back</h2>
          <p className="mt-1 text-sm text-ink-muted">Sign in to your matchmaker workspace.</p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="matchmaker@tdc.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={formState.errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={formState.errors.password?.message}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="rounded-full p-2 text-ink-muted hover:text-ink cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('password', { required: 'Password is required' })}
            />

            {formError && (
              <div className="flex items-center gap-2 rounded-2xl bg-rose-soft/50 px-4 py-3 text-sm text-rose-deep">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loginMutation.isPending}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            onClick={fillDemo}
            className="mt-4 w-full rounded-2xl border border-line bg-background/40 py-2.5 text-center text-sm font-medium text-ink-soft transition-colors hover:border-rose/40 hover:bg-rose-soft/20 hover:text-rose-deep cursor-pointer"
          >
            Use demo credentials
          </button>
        </motion.div>
      </div>
    </div>
  );
}
