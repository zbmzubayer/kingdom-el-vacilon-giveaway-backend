import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class SetEventWinnerDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  serial_number: number;

  @IsNotEmpty()
  @IsString()
  performed_by: string = 'Admin';
}
