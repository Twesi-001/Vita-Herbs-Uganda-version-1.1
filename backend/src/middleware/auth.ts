import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface AuthRequest extends Request {
  admin?: { username: string };
}

/** Issues a signed admin token (valid for 12 hours). */
export function signToken(username: string): string {
  return jwt.sign({ username }, JWT_SECRET!, { expiresIn: '12h' });
}

/** Protects admin routes. Accepts the token from the `Authorization: Bearer <token>` header only. */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET!) as { username: string };
    req.admin = { username: payload.username };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
