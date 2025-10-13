import { ENV } from '@/config/env';
import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { type Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/public/status')
  getStatus(@Req() req: Request) {
    const token = ENV.PUBLIC_API_TOKEN;
    if (token && req.query.token !== token) {
      throw new UnauthorizedException();
    }
  }
}
