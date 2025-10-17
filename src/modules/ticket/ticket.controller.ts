import { Body, Controller, Post } from '@nestjs/common';
import { CreateTicketCountDto } from './dto/create-ticket-count.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketService } from './ticket.service';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketService.create(createTicketDto);
  }

  @Post('/count')
  createByCount(@Body() createTicketCountDto: CreateTicketCountDto) {
    return this.ticketService.createByCount(createTicketCountDto);
  }
}
