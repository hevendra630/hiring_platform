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
    <div className="min-h-screen bg-[#0A0A0A] flex flex-row-reverse">
      {/* Right Pane - Image (reversed for variety) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/auth_background.png" 
            alt="AI Concept Background" 
            className="w-full h-full object-cover opacity-80"
            style={{ transform: 'scaleX(-1)' }} // flip image for variety
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-lg p-12 glassmorphism rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)] mx-8">
          <h2 className="text-4xl font-display font-bold text-white mb-6 leading-tight">
            Build the future with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">HireAI</span>.
          </h2>
          <p className="text-gray-400 text-lg">
            Join thousands of developers and recruiters bridging the gap between talent and opportunity through the power of AI.
          </p>
        </div>
      </div>

      {/* Left Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md space-y-10 relative z-10">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <LogoMark className="w-14 h-14" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">Create an account</h1>
            <p className="mt-3 text-gray-400">Join HireAI to start your journey.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 backdrop-blur-sm"
                placeholder="Jane Doe"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 backdrop-blur-sm"
                placeholder="name@company.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 backdrop-blur-sm"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-sm mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    value="candidate"
                    {...register('role')}
                    className="peer sr-only"
                  />
                  <div className="w-full text-center py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-gray-400 peer-checked:border-primary peer-checked:text-white peer-checked:bg-primary/10 transition-all duration-300">
                    Candidate
                  </div>
                </label>
                <label className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    value="recruiter"
                    {...register('role')}
                    className="peer sr-only"
                  />
                  <div className="w-full text-center py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-gray-400 peer-checked:border-primary peer-checked:text-white peer-checked:bg-primary/10 transition-all duration-300">
                    Recruiter
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full py-3 mt-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-0.5"
            >
              {signupMutation.isPending ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-accent font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
