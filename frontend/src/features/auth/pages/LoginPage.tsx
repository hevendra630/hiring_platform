import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useLogin, useGoogleLoginMutation } from '../useAuth';
import { LogoMark } from '@/components/ui/LogoMark';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const loginMutation = useLogin();
  const googleMutation = useGoogleLoginMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => loginMutation.mutate(data);

  const googleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setIsGoogleLoading(true);
      googleMutation.mutate(
        { idToken: codeResponse.access_token }, 
        { onSettled: () => setIsGoogleLoading(false) }
      );
    },
    onError: () => toast.error('Google login failed'),
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left Pane - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/auth_background.png" 
            alt="AI Concept Background" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-lg p-12 glassmorphism rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)] mx-8">
          <LogoMark variant="full" className="w-10 h-10 mb-8" />
          <h2 className="text-4xl font-display font-bold text-white mb-6 leading-tight">
            Discover the top <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">1% of engineers</span> using AI.
          </h2>
          <p className="text-gray-400 text-lg">
            HireAI automates the technical interview process so you can focus on building your dream team.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md space-y-10 relative z-10">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <LogoMark className="w-14 h-14" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">Welcome back</h1>
            <p className="mt-3 text-gray-400">Enter your details to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-light transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                {...register('password')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 backdrop-blur-sm"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-sm mt-1.5">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-0.5"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">or continue with</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button
            onClick={() => googleLogin()}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isGoogleLoading ? 'Signing in...' : 'Google'}
          </button>

          <p className="text-center text-gray-400 text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-accent font-medium transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
