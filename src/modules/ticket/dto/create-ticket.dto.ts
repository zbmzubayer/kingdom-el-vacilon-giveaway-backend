import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  event_id: string;

  @IsOptional()
  @IsString()
  external_order_id: string;

  @IsOptional()
  @IsString()
  buyer_name: string;

  @IsOptional()
  @IsEmail()
  buyer_email: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity: number;
}
