import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from 'entities/bid.entity';
import { User } from 'entities/user.entity';
import { AuctionItem } from 'entities/auction-item.entity';
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([AuctionItem]),
  ],
  controllers: [BidsController],
  providers: [
    BidsService,
  ],
})
export class BidsModule {}
