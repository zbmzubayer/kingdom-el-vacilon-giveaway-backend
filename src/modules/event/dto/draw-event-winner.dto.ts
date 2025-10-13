import { IsNotEmpty, IsString } from 'class-validator';

export class DrawEventWinnerDto {
  @IsNotEmpty()
  @IsString()
  performed_by: string = 'admin';
}
