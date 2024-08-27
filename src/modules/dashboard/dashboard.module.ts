import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuctionsModule } from 'modules/auctions/auctions.module';
import { BidsModule } from 'modules/bids/bids.module';

@Module({
  imports: [AuctionsModule, BidsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  // exports: [DashboardService]
})
export class DashboardModule {}
