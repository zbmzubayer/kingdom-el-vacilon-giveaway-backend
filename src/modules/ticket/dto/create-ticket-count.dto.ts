import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateTicketCountDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  count: number;

  @IsNotEmpty()
  @IsString()
  event_id: string;
}
