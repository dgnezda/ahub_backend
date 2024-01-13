import { Module } from '@nestjs/common'
import { AuctionsService } from './auctions.service'
import { AuctionsController } from './auctions.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuctionItem } from 'entities/auction-item.entity'
import { User } from 'entities/user.entity'
import { Bid } from 'entities/bid.entity'
import { BidsService } from 'modules/bids/bids.service'
import { UsersService } from 'modules/users/users.service'
import { AuctionsGateway } from './auctions.gateway'

@Module({
  imports: [
    TypeOrmModule.forFeature([AuctionItem, User, Bid]),
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService, BidsService, UsersService, AuctionsGateway],
})
export class AuctionsModule {}
