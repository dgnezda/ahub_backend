import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionItem } from 'entities/auction-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuctionItem])],
  controllers: [AuctionsController],
  providers: [AuctionsService],
})
export class AuctionsModule {}
