import { IsNotEmpty, IsString } from 'class-validator';

export class PublicGetEventQueryDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  eventId: string;
}
