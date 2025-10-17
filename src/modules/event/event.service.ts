import { EVENT_STATUS } from '@/enums/event.enum';
import { DrawEventWinnerDto } from '@/modules/event/dto/draw-event-winner.dto';
import { SetEventWinnerDto } from '@/modules/event/dto/set-event-winner.dto';
import { PrismaService } from '@/modules/prisma/prisma.service';
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
    return this.prisma.event.findMany({
      orderBy: { created_at: 'desc' },
      include: { _count: { select: { tickets: true } } },
    });
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

  findTicketsByEventId(id: string) {
    return this.prisma.ticket.findMany({
      where: { event_id: id },
      orderBy: { serial_number: 'asc' },
    });
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

  async drawEventWinner(id: string, drawEventWinnerDto: DrawEventWinnerDto) {
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

  async setEventWinner(id: string, setEventWinnerDto: SetEventWinnerDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { status: true, tickets_total: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    if (event.status === EVENT_STATUS.completed) {
      throw new ConflictException('Event already completed');
    }

    const ticket = await this.prisma.ticket.findFirst({
      where: { event_id: id, serial_number: setEventWinnerDto.serial_number },
    });

    if (!ticket) throw new NotFoundException('Ticket with given serial number not found');

    const [log] = await this.prisma.$transaction([
      this.prisma.drawLog.create({
        data: {
          event_id: id,
          performed_by: setEventWinnerDto.performed_by,
          method: 'manual_serial',
          picked_ticket_id: ticket.id,
        },
      }),
      this.prisma.event.update({
        where: { id },
        data: { status: EVENT_STATUS.completed, winner_ticket_id: ticket.id },
      }),
    ]);

    return {
      drawLogId: log.id,
      winnerSerial: ticket.serial_number,
      winnerName: ticket.buyer_name ?? null,
      winnerEmail: ticket.buyer_email ?? null,
    };
  }
}
