import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AbstractService } from 'modules/common/abstract.service';
import { NotificationsGateway } from 'modules/notifications/notifications.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'entities/user.entity';
import { Notification } from 'entities/notification.entity';

@Injectable()
export class NotificationsService extends AbstractService {
  constructor(@InjectRepository(Notification) private notificationsRepository: Repository<Notification>, 
    private readonly notificationsGateway: NotificationsGateway
    ) {
      super(notificationsRepository)
    }

  async create(createNotificationDto: CreateNotificationDto, user: User) {
    return 'This action adds a new notification'; 
  }

  async getNotifications() {}

  async notifyUser(userId: string, notification: string) {
    const client = await this.notificationsGateway.getClientByUserId(userId)
    if (client) client.emit('notification', notification)
  }

  async clearNotificationsForUser(userId: string): Promise<void> {
    // this.notificationsRepository
  }

}
