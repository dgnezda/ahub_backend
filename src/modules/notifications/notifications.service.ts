import { Injectable } from '@nestjs/common'
import { AbstractService } from 'modules/common/abstract.service'
import { NotificationsGateway } from 'modules/notifications/notifications.gateway'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from 'entities/user.entity'
import { Notification } from 'entities/notification.entity'
import { AuctionItem } from 'entities/auction-item.entity'
import { BidTag } from 'interfaces/bid-tag.interface'
import { Bid } from 'entities/bid.entity'

@Injectable()
export class NotificationsService extends AbstractService {
  constructor(
    @InjectRepository(Notification) private notificationsRepository: Repository<Notification>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super(notificationsRepository)
  }

  /**
   * Notify a single user about a bid on an auction item.
   * @param userId - The ID of the user to notify.
   * @param auctionItem - The auction item the bid is related to.
   * @param bid - The bid related to the notification.
   */
  async notifyUser(userId: string, auctionItem: AuctionItem, bid: Bid) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) return;

    // Create the notification
    const notification = this.notificationsRepository.create({
      user,
      auction_item: auctionItem,
      bid_tag: bid.status_tag, // Attach the bid's status tag
      is_read: false,
    });

    // Save the notification to the database
    await this.notificationsRepository.save(notification);

    // Send the notification to the user via WebSocket if connected
    const client = await this.notificationsGateway.getClientByUserId(userId);
    if (client) client.emit('notification', { notification, bid }); // Emit the notification along with the bid
  }

  /**
   * Notify multiple users about bids on an auction item.
   * @param usersToNotify - The users to notify.
   * @param auctionItem - The auction item the bids are related to.
   * @param bids - The bids related to the notification.
   */
  async notifyUsers(usersToNotify: User[], auctionItem: AuctionItem, bids: Bid[]): Promise<void> {
    for (const user of usersToNotify) {
      // Find the bids related to the current user
      const userBids = bids.filter(bid => bid.user.id === user.id);
      for (const bid of userBids) {
        // Notify the user about each of their bids
        await this.notifyUser(user.id, auctionItem, bid);
      }
    }
  }

  /**
   * Mark all notifications for a user as read.
   * @param userId - The ID of the user whose notifications are to be cleared.
   */
  async clearNotificationsForUser(userId: string): Promise<void> {
    await this.notificationsRepository.update({ user: { id: userId } }, { is_read: true });
  }
}