import { userRepository } from '@repositories/user.repository';
import { sessionRepository } from '@repositories/session.repository';
import { tokenService } from './token.service';
import { emailService } from './email.service';
import { verifyGoogleIdToken } from './googleAuth.service';
import { signAccessToken, signRefreshToken, verifyRefreshToken, JwtPayload } from '@utils/jwt';
import { ApiError } from '@utils/ApiError';
import { env } from '@config/env';
import { IUser, UserRole } from '@models/User';
import ms from '@utils/ms';

interface DeviceContext {
  userAgent?: string;
  ipAddress?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function toJwtPayload(user: IUser): JwtPayload {
  return { sub: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion };
}

class AuthService {
  async signup(input: { name: string; email: string; password: string; role: UserRole }): Promise<IUser> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      authProvider: 'local',
    });

    const { plainToken, hashedToken } = tokenService.generateTokenPair();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await userRepository.save(user);

    const verifyUrl = `${env.clientUrl}/verify-email?token=${plainToken}`;
    await emailService.sendVerificationEmail(user.email, user.name, verifyUrl);

    return user;
  }

  async login(
    input: { email: string; password: string },
    device: DeviceContext,
  ): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(input.email, true);
    if (!user || user.authProvider !== 'local') {
      throw ApiError.unauthorized('Invalid email or password');
    }
    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) throw ApiError.unauthorized('Invalid email or password');
    if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');

    user.lastLoginAt = new Date();
    await userRepository.save(user);

    const tokens = await this.issueTokenPair(user, device);
    return { user, tokens };
  }

  async googleLogin(
    idToken: string,
    requestedRole: UserRole | undefined,
    device: DeviceContext,
  ): Promise<{ user: IUser; tokens: AuthTokens }> {
    const profile = await verifyGoogleIdToken(idToken);

    let user = await userRepository.findByGoogleId(profile.googleId);
    if (!user) {
      user = await userRepository.findByEmail(profile.email);
    }

    if (!user) {
      user = await userRepository.create({
        name: profile.name,
        email: profile.email,
        role: requestedRole ?? 'candidate',
        authProvider: 'google',
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
        isEmailVerified: profile.emailVerified,
      });
    } else if (!user.googleId) {
      // Existing local account signing in with Google for the first time - link it.
      user.googleId = profile.googleId;
      user.authProvider = 'google';
      if (!user.avatarUrl) user.avatarUrl = profile.avatarUrl;
      await userRepository.save(user);
    }

    if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');

    const tokens = await this.issueTokenPair(user, device);
    return { user, tokens };
  }

  async verifyEmail(plainToken: string): Promise<void> {
    const hashed = tokenService.hash(plainToken);
    const user = await userRepository.findByEmailVerificationToken(hashed);
    if (!user) throw ApiError.badRequest('Verification link is invalid or has expired');

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await userRepository.save(user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    // Always respond success-shaped to the caller (controller) to avoid leaking
    // which emails are registered - but only actually send mail if found.
    if (!user || user.authProvider !== 'local') return;

    const { plainToken, hashedToken } = tokenService.generateTokenPair();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await userRepository.save(user);

    const resetUrl = `${env.clientUrl}/reset-password?token=${plainToken}`;
    await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl);
  }

  async resetPassword(plainToken: string, newPassword: string): Promise<void> {
    const hashed = tokenService.hash(plainToken);
    const user = await userRepository.findByPasswordResetToken(hashed);
    if (!user) throw ApiError.badRequest('Reset link is invalid or has expired');

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.tokenVersion += 1; // invalidate all existing refresh tokens
    await userRepository.save(user);
    await sessionRepository.revokeAllForUser(user._id);
  }

  async refresh(refreshToken: string, device: DeviceContext): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const session = await sessionRepository.findActiveByToken(refreshToken);
    if (!session) throw ApiError.unauthorized('Refresh token has been revoked');

    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive || user.tokenVersion !== payload.tokenVersion) {
      throw ApiError.unauthorized('Session is no longer valid');
    }

    // Rotate: revoke the old session, issue a brand-new pair.
    await sessionRepository.revoke(session._id);
    return this.issueTokenPair(user, device);
  }

  async logout(refreshToken: string): Promise<void> {
    const session = await sessionRepository.findActiveByToken(refreshToken);
    if (session) await sessionRepository.revoke(session._id);
  }

  async logoutAll(userId: string): Promise<void> {
    await userRepository.incrementTokenVersion(userId);
    await sessionRepository.revokeAllForUser(userId);
  }

  private async issueTokenPair(user: IUser, device: DeviceContext): Promise<AuthTokens> {
    const payload = toJwtPayload(user);
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await sessionRepository.create({
      user: user._id,
      refreshToken,
      userAgent: device.userAgent,
      ipAddress: device.ipAddress,
      expiresAt: new Date(Date.now() + ms(env.jwt.refreshExpiresIn)),
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
