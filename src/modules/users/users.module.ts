import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'entities/user.entity'
import { AuctionsService } from 'modules/auctions/auctions.service'
import { AuctionItem } from 'entities/auction-item.entity'
import { Bid } from 'entities/bid.entity'
import { NotificationsModule } from 'modules/notifications/notifications.module'

@Module({
  imports: [TypeOrmModule.forFeature([User, AuctionItem, Bid]), NotificationsModule],
  controllers: [UsersController],
  providers: [UsersService, AuctionsService],
  exports: [UsersService],
})
export class UsersModule {}
