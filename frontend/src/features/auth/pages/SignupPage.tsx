import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useSignup } from '../useAuth';
import { LogoMark } from '@/components/ui/LogoMark';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  role: z.enum(['candidate', 'recruiter']),
});

type SignupForm = z.infer<typeof signupSchema>;

export function SignupPage() {
  const signupMutation = useSignup();
  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'candidate' },
  });

  const onSubmit = (data: SignupForm) => signupMutation.mutate(data);

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <LogoMark className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold font-display text-ink">Create Account</h1>
          <p className="mt-2 text-ink-muted">Join HireAI to start your journey</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Full Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-2 bg-base-surface border border-base-border rounded-lg text-ink placeholder-ink-subtle focus-visible:border-primary focus-visible:shadow-glow transition"
              placeholder="Jane Doe"
            />
            {errors.name && <p className="text-danger text-sm mt-1">{errors.name.message}</p>}
          </div>

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

          <div>
            <label className="block text-sm font-medium text-ink mb-2">I am a</label>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="candidate"
                  {...register('role')}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-ink">Candidate (looking for roles)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="recruiter"
                  {...register('role')}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-ink">Recruiter (hiring engineers)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full py-2 bg-primary shadow-neon hover:bg-primary shadow-neon-hover text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {signupMutation.isPending ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-ink-muted text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] hover:text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]-hover transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
