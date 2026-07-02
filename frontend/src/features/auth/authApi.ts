import { apiClient } from '@/services/apiClient';
import { ApiSuccess, User } from '@/types';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: 'candidate' | 'recruiter';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  signup: (payload: SignupPayload) =>
    apiClient.post<ApiSuccess<{ user: User }>>('/auth/signup', payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    apiClient
      .post<ApiSuccess<{ user: User; accessToken: string }>>('/auth/login', payload)
      .then((r) => r.data),

  googleLogin: (idToken: string, role?: 'candidate' | 'recruiter') =>
    apiClient
      .post<ApiSuccess<{ user: User; accessToken: string }>>('/auth/google', { idToken, role })
      .then((r) => r.data),

  refresh: () => apiClient.post<ApiSuccess<{ accessToken: string }>>('/auth/refresh').then((r) => r.data),

  logout: () => apiClient.post<ApiSuccess<null>>('/auth/logout').then((r) => r.data),

  verifyEmail: (token: string) =>
    apiClient.post<ApiSuccess<null>>('/auth/verify-email', { token }).then((r) => r.data),

  forgotPassword: (email: string) =>
    apiClient.post<ApiSuccess<null>>('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiSuccess<null>>('/auth/reset-password', { token, password }).then((r) => r.data),

  getMe: () => apiClient.get<ApiSuccess<{ user: User }>>('/users/me').then((r) => r.data),
};
