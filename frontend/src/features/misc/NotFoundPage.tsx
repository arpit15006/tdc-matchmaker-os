import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-serif text-6xl text-rose">404</p>
      <h1 className="mt-4 font-serif text-2xl text-ink">This page wandered off</h1>
      <p className="mt-2 text-ink-muted">The page you're looking for doesn't exist.</p>
      <Button className="mt-6" onClick={() => navigate('/dashboard')}>
        Back to dashboard
      </Button>
    </div>
  );
}
