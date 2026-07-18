import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { ApiError } from '@utils/ApiError';
import { authService } from '@services/auth.service';
import { env } from '@config/env';

const REFRESH_COOKIE = 'refreshToken';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? ('none' as const) : ('lax' as const),
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function deviceContext(req: Request) {
  return { userAgent: req.headers['user-agent'], ipAddress: req.ip };
}

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.signup(req.body);
  res
    .status(201)
    .json(
      new ApiResponse(201, 'Account created. Please check your email to verify your account.', {
        user,
      }),
    );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.login(req.body, deviceContext(req));
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions());
  res.status(200).json(
    new ApiResponse(200, 'Logged in successfully', {
      user,
      accessToken: tokens.accessToken,
    }),
  );
});

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken, role } = req.body;
  const { user, tokens } = await authService.googleLogin(idToken, role, deviceContext(req));
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions());
  res.status(200).json(new ApiResponse(200, 'Logged in with Google', { user, accessToken: tokens.accessToken }));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('No refresh token provided');

  const tokens = await authService.refresh(token, deviceContext(req));
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions());
  res.status(200).json(new ApiResponse(200, 'Token refreshed', { accessToken: tokens.accessToken }));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
  res.status(200).json(new ApiResponse(200, 'Logged out successfully'));
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutAll(req.user!.id);
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
  res.status(200).json(new ApiResponse(200, 'Logged out from all devices'));
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.body.token);
  res.status(200).json(new ApiResponse(200, 'Email verified successfully'));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  res
    .status(200)
    .json(new ApiResponse(200, 'If an account exists for that email, a reset link has been sent.'));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.status(200).json(new ApiResponse(200, 'Password reset successfully. Please log in again.'));
});
