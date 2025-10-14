import { ENV } from '@/config/env';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { sign } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  login(loginDto: LoginDto) {
    if (loginDto.password !== ENV.ADMIN_BASIC_AUTH_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }

    const token = sign({ id: loginDto.password, role: 'admin' }, ENV.JWT_SECRET, {
      expiresIn: '1d',
    });

    return { token };
  }
}
