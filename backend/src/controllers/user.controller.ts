import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { ApiError } from '@utils/ApiError';
import { userRepository } from '@repositories/user.repository';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userRepository.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');
  res.status(200).json(new ApiResponse(200, 'Current user fetched', { user }));
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name, avatarUrl } = req.body as { name?: string; avatarUrl?: string };
  const user = await userRepository.updateById(req.user!.id, {
    ...(name ? { name } : {}),
    ...(avatarUrl ? { avatarUrl } : {}),
  } as never);
  if (!user) throw ApiError.notFound('User not found');
  res.status(200).json(new ApiResponse(200, 'Profile updated', { user }));
});
