import { Module } from '@nestjs/common'
import { BidsService } from './bids.service'
import { BidsController } from './bids.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Bid } from 'entities/bid.entity'
import { User } from 'entities/user.entity'
import { AuctionItem } from 'entities/auction-item.entity'
import { AuctionsService } from 'modules/auctions/auctions.service'
import { NotificationsService } from 'modules/notifications/notifications.service'
import { Notification } from 'entities/notification.entity'
import { NotificationsGateway } from 'modules/notifications/notifications.gateway'

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid]), 
    TypeOrmModule.forFeature([User]), 
    TypeOrmModule.forFeature([AuctionItem]),
    TypeOrmModule.forFeature([Notification]),
  ],
  controllers: [BidsController],
  providers: [BidsService, AuctionsService, NotificationsService, NotificationsGateway],
})
export class BidsModule {}
