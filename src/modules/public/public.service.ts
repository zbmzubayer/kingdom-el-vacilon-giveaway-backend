import { EVENT_STATUS } from '@/enums/event.enum';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { PublicGetEventQueryDto } from '@/modules/public/dto/public-get-event-query.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getEventStatus(query: PublicGetEventQueryDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: query.eventId },
      select: {
        id: true,
        title: true,
        car_info: true,
        tickets_total: true,
        status: true,
        winner_ticket_id: true,
        _count: { select: { tickets: true } },
      },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.status === EVENT_STATUS.completed && event.winner_ticket_id) {
      const winner = await this.prisma.ticket.findUnique({
        where: { id: event.winner_ticket_id },
        select: { buyer_name: true, serial_number: true },
      });
      return {
        title: event.title,
        tickets_total: event.tickets_total,
        tickets_sold: event._count.tickets,
        status: event.status,
        winner,
      };
    }
    return {
      title: event.title,
      tickets_total: event.tickets_total,
      tickets_sold: event._count.tickets,
      status: event.status,
      winner: null,
    };
  }
}
