import { CreateTicketDto } from '@/modules/ticket/dto/create-ticket.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('/ghl/order')
  create(@Body() createWebhookDto: CreateTicketDto) {
    return this.webhookService.createGhlOrder(createWebhookDto);
  }
}
