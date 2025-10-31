import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PublicGetEventQueryDto {
  @IsOptional()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  eventId: string;
}
