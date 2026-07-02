import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLogin } from '../useAuth';
import { LogoMark } from '@/components/ui/LogoMark';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const loginMutation = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => loginMutation.mutate(data);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // In a real app, you'd use @react-oauth/google or similar to get the idToken here.
      // For now, this is a stub.
      toast.error('Google login integration coming soon');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <LogoMark className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold font-display text-ink">Sign In</h1>
          <p className="mt-2 text-ink-muted">Log in to access your interviews</p>
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

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Password</label>
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
            disabled={loginMutation.isPending}
            className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-base-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-base text-ink-muted">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full py-2 border border-base-border rounded-lg text-ink hover:bg-base-raised transition disabled:opacity-50"
        >
          {isGoogleLoading ? 'Signing in...' : 'Google'}
        </button>

        <p className="text-center text-ink-muted text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:text-primary-hover transition">
            Sign up
          </Link>
        </p>

        <div className="text-center">
          <Link to="/forgot-password" className="text-primary hover:text-primary-hover text-sm transition">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
