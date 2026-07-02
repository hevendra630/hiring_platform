import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'react-router-dom';
import { useResetPassword } from '../useAuth';
import { LogoMark } from '@/components/ui/LogoMark';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const mutation = useResetPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordForm) => {
    if (!token) return;
    mutation.mutate({ token, password: data.password });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink">Invalid Reset Link</h1>
          <p className="text-ink-muted mt-2">This reset link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <LogoMark className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold font-display text-ink">Reset Password</h1>
          <p className="mt-2 text-ink-muted">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">New Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-4 py-2 bg-base-surface border border-base-border rounded-lg text-ink placeholder-ink-subtle focus-visible:border-primary focus-visible:shadow-glow transition"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-danger text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {mutation.isPending ? 'Setting password...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
