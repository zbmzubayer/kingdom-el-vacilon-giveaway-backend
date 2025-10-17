import { EVENT_STATUS } from '@/enums/event.enum';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { CreateTicketDto } from '@/modules/ticket/dto/create-ticket.dto';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async createGhlOrder(createTicketDto: CreateTicketDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: createTicketDto.event_id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== EVENT_STATUS.open) {
      throw new ConflictException('Event is not open');
    }

    const dup = await this.prisma.ticket.count({
      where: {
        event_id: createTicketDto.event_id,
        external_order_id: createTicketDto.external_order_id,
      },
    });

    if (dup > 0) return { created: 0, reason: 'duplicate_order' };

    const current = await this.prisma.ticket.count({
      where: { event_id: createTicketDto.event_id },
    });

    const remaining = event.tickets_total - current;
    if (createTicketDto.quantity > remaining)
      throw new ConflictException(`exceeds_capacity:${remaining}`);

    const serialStart = current + 1;
    const rows = Array.from({ length: createTicketDto.quantity }, (_, i) => ({
      event_id: createTicketDto.event_id,
      external_order_id: createTicketDto.external_order_id,
      buyer_name: createTicketDto.buyer_name ?? null,
      buyer_email: createTicketDto.buyer_email ?? null,
      serial_number: serialStart + i,
    }));

    const { count } = await this.prisma.ticket.createMany({ data: rows, skipDuplicates: true });

    return {
      created: count,
      serial_start: serialStart,
      serial_end: serialStart + createTicketDto.quantity - 1,
    };
  }
}
