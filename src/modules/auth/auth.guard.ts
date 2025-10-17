import { ENV } from '@/config/env';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { NextFunction, Request } from 'express';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
    const req: Request = context.switchToHttp().getRequest();
    // const res: Response = context.switchToHttp().getResponse();
    const next: NextFunction = context.switchToHttp().getNext();
    try {
      const authToken = req.headers.authorization;
      // Check if the token is present in the request headers
      if (!authToken) {
        throw new UnauthorizedException('No token provided');
      }
      if (!authToken.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid token format');
      }
      const token = authToken.split(' ')[1];
      const decodedToken = verify(token, ENV.JWT_SECRET);
      if (!decodedToken || typeof decodedToken === 'string' || !decodedToken.id) {
        throw new UnauthorizedException('Invalid token');
      }
      if (decodedToken.id !== ENV.ADMIN_BASIC_AUTH_PASSWORD) {
        throw new UnauthorizedException('Invalid token');
      }

      return true;
    } catch (error) {
      Logger.error(error);
      next(error);
      return false;
    }
  }
}
