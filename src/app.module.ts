import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './modules/event/event.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { PublicModule } from './modules/public/public.module';
import { AuthModule } from './modules/auth/auth.module';
import { WebhookModule } from './modules/webhook/webhook.module';

@Module({
  imports: [PrismaModule, EventModule, TicketModule, PublicModule, AuthModule, WebhookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
