import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from './notifications.gateway';
import { GetUserId } from 'decorators/get-user-id.decorator';
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard';
import { GetUser } from 'decorators/get-user.decorator';
import { User } from 'entities/user.entity';
import Logging from 'lib/Logging';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly eventsGateway: NotificationsGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto, @GetUser() user: User) {
    return this.notificationsService.create(createNotificationDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('clear')
  clearNotifications(@GetUserId() userId: string) {
    if (userId) {
      this.notificationsService.clearNotificationsForUser(userId)

      const client = this.eventsGateway.getClientByUserId(userId)
      if (client) client.emit('notificationsCleared')

      return { message: 'Notifications cleared successfully'}
    } else {
      throw new BadRequestException()
    }
  }

  @Get()
  getNotifications() {
    return this.notificationsService.getNotifications()
  }
}
