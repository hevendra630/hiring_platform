import { useMutation, useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi, LoginPayload, SignupPayload } from './authApi';
import { setCredentials, setUser, finishInitializing, clearAuth } from './authSlice';
import { AppDispatch } from '@/store/store';

function dashboardPathForRole(role: string) {
  if (role === 'recruiter') return '/recruiter';
  if (role === 'admin') return '/admin';
  return '/candidate';
}

export function useSignup() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: SignupPayload) => authApi.signup(payload),
    onSuccess: (res) => {
      toast.success(res.message);
      navigate('/login');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useLogin() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (res) => {
      if (!res.data) return;
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      toast.success('Welcome back!');
      navigate(dashboardPathForRole(res.data.user.role));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}
export function useGoogleLoginMutation() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: { idToken: string; role?: 'candidate' | 'recruiter' }) =>
      authApi.googleLogin(payload.idToken, payload.role),
    onSuccess: (res) => {
      if (!res.data) return;
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      toast.success('Welcome back!');
      navigate(dashboardPathForRole(res.data.user.role));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}
export function useLogout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      dispatch(clearAuth());
      navigate('/login');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: (res) => toast.success(res.message),
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useResetPassword() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: (res) => {
      toast.success(res.message);
      navigate('/login');
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

/**
 * Runs once on app boot: tries to exchange the httpOnly refresh-token cookie
 * (if present) for a fresh access token + current user, so a page reload
 * doesn't bounce an already-logged-in user back to /login.
 */
export function useBootstrapAuth() {
  const dispatch = useDispatch<AppDispatch>();
  return useQuery({
    queryKey: ['bootstrap-auth'],
    queryFn: async () => {
      try {
        const refreshRes = await authApi.refresh();
        if (!refreshRes.data) throw new Error('no token');
        const meRes = await authApi.getMe();
        if (meRes.data) {
          dispatch(setCredentials({ user: meRes.data.user, accessToken: refreshRes.data.accessToken }));
        }
      } catch {
        dispatch(finishInitializing());
      }
      return null;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useRefreshCurrentUser() {
  const dispatch = useDispatch<AppDispatch>();
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await authApi.getMe();
      if (res.data) dispatch(setUser(res.data.user));
      return res.data?.user ?? null;
    },
    enabled: false,
  });
}

function extractErrorMessage(err: unknown): string {
  const anyErr = err as { response?: { data?: { message?: string } } };
  return anyErr.response?.data?.message ?? 'Something went wrong. Please try again.';
}
