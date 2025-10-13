import { ENV } from '@/config/env';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const next: NextFunction = context.switchToHttp().getNext();
    try {
      const authToken = req.headers.authorization?.split(' ')[1];
      // Check if the token is present in the request headers
      const encoded = authToken?.startsWith('Basic ') ? authToken.slice(6) : '';
      const decoded = Buffer.from(encoded, 'base64').toString('utf8');
      const pass = decoded.split(':')[1] || '';
      if (pass !== ENV.ADMIN_BASIC_AUTH_PASSWORD) {
        res.setHeader('WWW-Authenticate', 'Basic realm="admin"');
        throw new UnauthorizedException('Authentication required');
      }

      return true;
    } catch (error) {
      Logger.error(error);
      next(error);
      return false;
    }
  }
}
