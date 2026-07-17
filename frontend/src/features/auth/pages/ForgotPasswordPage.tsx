import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../useAuth';
import { LogoMark } from '@/components/ui/LogoMark';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const mutation = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordForm) => mutation.mutate(data.email);

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <LogoMark className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold font-display text-ink">Forgot Password</h1>
          <p className="mt-2 text-ink-muted">We'll send you a link to reset your password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-2 bg-base-surface border border-base-border rounded-lg text-ink placeholder-ink-subtle focus-visible:border-primary focus-visible:shadow-glow transition"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-danger text-sm mt-1">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-2 bg-primary shadow-neon hover:bg-primary shadow-neon-hover text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {mutation.isPending ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-ink-muted text-sm">
          <Link to="/login" className="text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] hover:text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]-hover transition">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
