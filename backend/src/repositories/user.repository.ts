import { User, IUser, UserRole } from '@models/User';
import { Types } from 'mongoose';

export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  role?: UserRole;
  authProvider?: 'local' | 'google';
  googleId?: string;
  avatarUrl?: string;
  isEmailVerified?: boolean;
}

/**
 * Repository Pattern: services never call `User.find...` directly.
 * This keeps Mongoose-specific query logic in one place and makes the
 * service layer unit-testable with a mocked repository.
 */
export class UserRepository {
  async create(input: CreateUserInput): Promise<IUser> {
    return User.create(input);
  }

  async findById(id: string | Types.ObjectId): Promise<IUser | null> {
    return User.findById(id);
  }

  async findByEmail(email: string, withPassword = false): Promise<IUser | null> {
    const query = User.findOne({ email: email.toLowerCase() });
    return withPassword ? query.select('+password') : query;
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return User.findOne({ googleId });
  }

  async findByEmailVerificationToken(hashedToken: string): Promise<IUser | null> {
    return User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');
  }

  async findByPasswordResetToken(hashedToken: string): Promise<IUser | null> {
    return User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires +password');
  }

  async save(user: IUser): Promise<IUser> {
    return user.save();
  }

  async updateById(id: string | Types.ObjectId, update: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, update, { new: true });
  }

  async incrementTokenVersion(id: string | Types.ObjectId): Promise<void> {
    await User.updateOne({ _id: id }, { $inc: { tokenVersion: 1 } });
  }
}

export const userRepository = new UserRepository();
