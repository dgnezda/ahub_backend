import { Injectable } from '@nestjs/common'
import { AbstractService } from 'modules/common/abstract.service'
import { NotificationsGateway } from 'modules/notifications/notifications.gateway'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from 'entities/user.entity'
import { Notification } from 'entities/notification.entity'
import { AuctionItem } from 'entities/auction-item.entity'

@Injectable()
export class NotificationsService extends AbstractService {
  constructor(
    @InjectRepository(Notification) private notificationsRepository: Repository<Notification>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super(notificationsRepository)
  }

  async notifyUser(userId: string, notification: any) {
    // ANY?
    const client = await this.notificationsGateway.getClientByUserId(userId)
    if (client) client.emit('notification', notification)
  }

  async notifyUsers(usersToNotify: User[], auctionItem: AuctionItem): Promise<void> {
    for (const user of usersToNotify) {
      this.notifyUser(user.id, auctionItem)
    }
  }

  async clearNotificationsForUser(userId: string): Promise<void> {
    const user = (await this.usersRepository.findOne({ where: { id: userId } })) as User
    user.notifications = []
  }
}
