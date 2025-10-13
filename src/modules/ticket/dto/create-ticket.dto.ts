import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  targetCount: number;
}
