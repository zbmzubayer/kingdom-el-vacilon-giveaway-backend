import { EVENT_STATUS } from '@/enums/event.enum';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { CreateTicketCountDto } from '@/modules/ticket/dto/create-ticket-count.dto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto) {
    const event = await this.prisma.event.findFirst({
      where: { id: createTicketDto.event_id },
      select: { status: true, tickets_total: true, _count: { select: { tickets: true } } },
    });

    if (!event) throw new NotFoundException('Event not found');

    if (event.status !== EVENT_STATUS.open) {
      throw new NotFoundException('Event is not open');
    }

    const current = event._count.tickets;

    if (createTicketDto.quantity + current > event.tickets_total) {
      const remaining = event.tickets_total - current;
      throw new BadRequestException(`Exceeds capacity: ${remaining}`);
    }

    const rows: Prisma.TicketCreateManyInput[] = [];

    for (let i = 0; i < createTicketDto.quantity; i++) {
      rows.push({
        event_id: createTicketDto.event_id,
        external_order_id: createTicketDto.external_order_id || null,
        buyer_name: createTicketDto.buyer_name || null,
        buyer_email: createTicketDto.buyer_email || null,
        serial_number: current + i + 1,
      });
    }

    let added = 0;

    return await this.prisma.$transaction(async (tx) => {
      while (rows.length) {
        const chunk = rows.splice(0, 1000);
        const { count } = await tx.ticket.createMany({ data: chunk });
        added += count;
      }
      return { added, sold: current + added };
    });
  }

  async createByCount(createTicketCountDto: CreateTicketCountDto) {
    const event = await this.prisma.event.findFirst({
      where: { id: createTicketCountDto.event_id },
      select: { status: true, tickets_total: true, _count: { select: { tickets: true } } },
    });

    if (!event) throw new NotFoundException('Event not found');

    if (event.status !== EVENT_STATUS.open) {
      throw new NotFoundException('Event is not open');
    }

    const current = event._count.tickets;

    if (current + createTicketCountDto.count > event.tickets_total) {
      const remaining = event.tickets_total - current;
      throw new BadRequestException(`Exceeds capacity: ${remaining}`);
    }

    const rows = Array.from({ length: createTicketCountDto.count }, (_, i) => ({
      event_id: createTicketCountDto.event_id,
      serial_number: current + i + 1,
    }));

    let added = 0;

    return await this.prisma.$transaction(async (tx) => {
      while (rows.length) {
        const chunk = rows.splice(0, 1000);
        const { count } = await tx.ticket.createMany({ data: chunk });
        added += count;
      }
      return { added, sold: current + added };
    });
  }
}
