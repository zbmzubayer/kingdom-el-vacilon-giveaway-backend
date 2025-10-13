import { ENV } from '@/config/env';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { hash } from '@/modules/auth/hash';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(loginDto: LoginDto) {
    if (loginDto.password !== ENV.ADMIN_BASIC_AUTH_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }

    const token = await hash.create(loginDto.password);
    return { token };
  }
}
