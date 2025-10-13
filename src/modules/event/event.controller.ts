import { ENV } from '@/config/env';
import { DrawEventWinnerDto } from '@/modules/event/dto/draw-event-winner.dto';
import { CreateTicketDto } from '@/modules/ticket/dto/create-ticket.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { type Request } from 'express';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }

  @Get(':id/sold')
  getTotalTicketSoldCount(@Param('id') id: string) {
    return this.eventService.getTotalTicketSoldCount(id);
  }

  @Post(':id/sales/sync')
  salesSync(@Param('id') id: string, @Body() createTicketDto: CreateTicketDto) {
    return this.eventService.salesSync(id, createTicketDto);
  }

  @Post(':id/draw')
  drawEventWinner(@Param('id') id: string, @Body() drawEventWinnerDto: DrawEventWinnerDto) {
    return this.eventService.drawWinner(id, drawEventWinnerDto);
  }

  @Get(':id/embed')
  getEventEmbedHtml(@Param('id') id: string, @Req() req: Request) {
    const base =
      process.env.NODE_ENV === 'production'
        ? `https://${req.headers.host}`
        : `http://localhost:${ENV.PORT || 8080}`;
    const token = ENV.PUBLIC_API_TOKEN ? ` data-token="${ENV.PUBLIC_API_TOKEN}"` : '';

    const html = [
      `<div id="giveaway-progress"></div>`,
      `<script src="${base}/widget.js" data-event-id="${req.params.id}"${token}></script>`,
    ].join('\n');

    return { html };
  }
}
