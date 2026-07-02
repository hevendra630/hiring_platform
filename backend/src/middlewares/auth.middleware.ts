import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/ApiError';
import { verifyAccessToken, UserRole } from '@utils/jwt';
import { User } from '@models/User';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: UserRole; tokenVersion: number };
    }
  }
}

/**
 * Verifies the Bearer access token, loads minimal user identity onto req.user.
 * Does NOT hit the DB for the password - only used to confirm the account
 * is still active and the tokenVersion hasn't been invalidated.
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or malformed Authorization header');
    }
    const token = header.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.sub).select('role isActive tokenVersion');
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Account is inactive or no longer exists');
    }
    if (user.tokenVersion !== payload.tokenVersion) {
      throw ApiError.unauthorized('Token has been invalidated, please log in again');
    }

    req.user = { id: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired access token'));
  }
};

/** Restricts a route to one or more roles. Use after `authenticate`. */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires role: ${allowedRoles.join(' or ')}`));
    }
    next();
  };
};
