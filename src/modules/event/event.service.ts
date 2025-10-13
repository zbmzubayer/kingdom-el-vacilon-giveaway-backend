import { EVENT_STATUS } from '@/enums/event.enum';
import { DrawEventWinnerDto } from '@/modules/event/dto/draw-event-winner.dto';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { CreateTicketDto } from '@/modules/ticket/dto/create-ticket.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    if (createEventDto.status === EVENT_STATUS.open) {
      const existingOpenEvent = await this.prisma.event.findFirst({
        where: { status: EVENT_STATUS.open },
        select: { id: true },
      });
      if (existingOpenEvent) {
        throw new ConflictException('An open event already exists');
      }
    }
    return this.prisma.event.create({ data: createEventDto });
  }

  findAll() {
    return this.prisma.event.findMany({ orderBy: { created_at: 'desc' } });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    // Validation: cannot reduce tickets_total below sold
    if (updateEventDto.tickets_total !== undefined) {
      const soldCount = await this.getTotalTicketSoldCount(event.id);
      if (updateEventDto.tickets_total < soldCount.sold) {
        throw new ConflictException('tickets_total below current sold');
      }
    }
    // If changing status to 'open', ensure there is no other 'open'
    if (updateEventDto.status === EVENT_STATUS.open && event.status !== EVENT_STATUS.open) {
      const existingOpenEvent = await this.prisma.event.findFirst({
        where: { status: EVENT_STATUS.open },
      });
      if (existingOpenEvent) {
        throw new ConflictException('An open event already exists');
      }
    }

    return this.prisma.event.update({ where: { id }, data: updateEventDto });
  }

  remove(id: string) {
    return this.prisma.event.delete({ where: { id } });
  }

  async getTotalTicketSoldCount(id: string) {
    const result = await this.prisma.event.findUnique({
      where: { id },
      select: {
        _count: { select: { tickets: true } },
      },
    });
    if (!result) throw new NotFoundException('Event not found');

    return { sold: result._count.tickets };
  }

  async salesSync(id: string, createTicketDto: CreateTicketDto) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    const soldCount = await this.getTotalTicketSoldCount(event.id);

    if (createTicketDto.targetCount <= soldCount.sold) {
      return { added: 0, sold: soldCount.sold };
    }

    // Insert serials soldCount+1 .. targetCount
    // const toAdd = parsed.data.targetCount - current;
    // const rows = Array.from({ length: toAdd }, (_, i) => ({
    //   event_id: ev.id,
    //   serial_number: BigInt(current + i + 1),
    // }));

    if (createTicketDto.targetCount >= event.tickets_total) {
      throw new BadRequestException('Event Sold Out');
    }
  }

  async drawWinner(id: string, drawEventWinnerDto: DrawEventWinnerDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { _count: { select: { tickets: true } }, tickets_total: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    const sold = event._count.tickets;

    if (sold !== event.tickets_total) {
      throw new BadRequestException('Not Sold Out');
    }

    // Pick random ticket by random offset
    const offset = Math.floor(Math.random() * sold);

    const winningTicket = await this.prisma.ticket.findFirst({
      where: { event_id: id },
      skip: offset,
    });
    if (!winningTicket) {
      throw new NotFoundException('Failed to draw winner');
    }

    await Promise.all([
      this.prisma.drawLog.create({
        data: {
          event_id: id,
          picked_ticket_id: winningTicket.id,
          performed_by: drawEventWinnerDto.performed_by,
        },
      }),
      this.prisma.event.update({
        where: { id },
        data: { status: EVENT_STATUS.completed, winner_ticket_id: winningTicket.id },
      }),
    ]);

    return {
      ticketSerial: winningTicket.serial_number,
      buyer_name: winningTicket.buyer_name,
      buyer_email: winningTicket.buyer_email,
    };
  }
}
