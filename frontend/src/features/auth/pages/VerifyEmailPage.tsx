import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../authApi';
import { LogoMark } from '@/components/ui/LogoMark';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const mutation = useMutation({
    mutationFn: (t: string) => authApi.verifyEmail(t),
    onSuccess: () => {
      toast.success('Email verified! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    },
    onError: () => {
      toast.error('Verification failed. Link may be invalid or expired.');
    },
  });

  useEffect(() => {
    if (token) {
      mutation.mutate(token);
    }
  }, [token, mutation]);

  return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <LogoMark className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold font-display text-ink">Verify Email</h1>

        {mutation.isPending && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-base-border border-t-primary rounded-full animate-spin" />
            </div>
            <p className="text-ink-muted">Verifying your email...</p>
          </div>
        )}

        {mutation.isSuccess && (
          <div className="space-y-4">
            <div className="text-4xl">✓</div>
            <p className="text-ink-muted">Email verified successfully!</p>
            <p className="text-ink-muted text-sm">Redirecting to login...</p>
          </div>
        )}

        {mutation.isError && (
          <div className="space-y-4">
            <p className="text-danger">Verification failed</p>
            <p className="text-ink-muted text-sm">The verification link may be invalid or expired.</p>
            <Link to="/login" className="text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] hover:text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]-hover transition">
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
