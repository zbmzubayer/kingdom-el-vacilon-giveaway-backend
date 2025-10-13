import { EVENT_STATUS, type EventStatus } from '@/enums/event.enum';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  car_info: string;

  @IsNotEmpty()
  @IsNumber()
  tickets_total: number;

  @IsNotEmpty()
  @IsNumber()
  ticket_price_cents: number;

  @IsNotEmpty()
  @IsEnum(EVENT_STATUS)
  status: EventStatus = EVENT_STATUS.open;
}
