import { ENV } from '@/config/env';
import { PublicGetEventQueryDto } from '@/modules/public/dto/public-get-event-query.dto';
import { Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('/status')
  getEventStatus(@Query() query: PublicGetEventQueryDto) {
    const token = ENV.PUBLIC_API_TOKEN;
    if (token && query.token !== token) {
      throw new UnauthorizedException();
    }

    return this.publicService.getEventStatus(query);
  }
}
