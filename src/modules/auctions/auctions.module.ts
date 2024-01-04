import { Module } from '@nestjs/common'
import { AuctionsService } from './auctions.service'
import { AuctionsController } from './auctions.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuctionItem } from 'entities/auction-item.entity'
import { User } from 'entities/user.entity'
import { Bid } from 'entities/bid.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([AuctionItem]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Bid]),
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService],
})
export class AuctionsModule {}
