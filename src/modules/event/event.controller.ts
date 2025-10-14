import { ENV } from '@/config/env';
import { AuthGuard } from '@/modules/auth/auth.guard';
import { DrawEventWinnerDto } from '@/modules/event/dto/draw-event-winner.dto';
import { CreateTicketDto } from '@/modules/ticket/dto/create-ticket.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }

  @Get(':id/sold')
  @UseGuards(AuthGuard)
  getTotalTicketSoldCount(@Param('id') id: string) {
    return this.eventService.getTotalTicketSoldCount(id);
  }

  @Post(':id/sales/sync')
  @UseGuards(AuthGuard)
  salesSync(@Param('id') id: string, @Body() createTicketDto: CreateTicketDto) {
    return this.eventService.salesSync(id, createTicketDto);
  }

  @Post(':id/draw')
  @UseGuards(AuthGuard)
  drawEventWinner(@Param('id') id: string, @Body() drawEventWinnerDto: DrawEventWinnerDto) {
    return this.eventService.drawWinner(id, drawEventWinnerDto);
  }

  @Get(':id/embed')
  @UseGuards(AuthGuard)
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

  @Get('/widget.js')
  getWidgetScript(@Req() req: Request, @Res() res: Response) {
    const base =
      ENV.NODE_ENV === 'production'
        ? `https://${req.headers.host}`
        : `http://localhost:${ENV.PORT || 8080}`;

    res.type('application/javascript').send(`(function(){
    function qs(el){return document.querySelector(el)}
    var script = document.currentScript;
    if(!script){return;}
    var eventId = script.getAttribute('data-event-id');
    if(!eventId){ return; }
    var token = script.getAttribute('data-token') || '';
    var mount = document.getElementById('giveaway-progress');
    if(!mount){ return; }

    function render(state){
      var sold = state.tickets_sold || 0, total = state.tickets_total || 0;
      var pct = total ? Math.floor((sold/total)*100) : 0;
      mount.innerHTML =
        '<div style="font-family:inherit;max-width:600px">' +
          '<div style="margin-bottom:8px;font-weight:600">' + (state.title||'') + '</div>' +
          '<div role="progressbar" aria-valuemin="0" aria-valuemax="'+ total +'" aria-valuenow="'+ sold +'" style="height:10px;border:1px solid #ccc;border-radius:6px;overflow:hidden">' +
            '<div style="height:100%;width:'+ pct +'%;"></div>' +
          '</div>' +
          '<div style="margin-top:6px;font-size:12px">' + sold + ' / ' + total + ' (' + pct + '%) — ' + (state.status||'') + '</div>' +
          (state.winner ? '<div style="margin-top:8px;font-weight:600">Winner: #'+ state.winner.serial + (state.winner.name ? ' — ' + state.winner.name : '') + '</div>' : '') +
        '</div>';
    }

    async function tick(){
      try{
        var url = '${base}/api/public/status?eventId=' + encodeURIComponent(eventId) + (token ? '&token=' + encodeURIComponent(token) : '');
        var r = await fetch(url, { cache: 'no-store' });
        if(!r.ok) return;
        var j = await r.json();
        render(j);
      }catch(e){}
    }
    tick();
    setInterval(tick, 45000);
  })();`);
  }
}
