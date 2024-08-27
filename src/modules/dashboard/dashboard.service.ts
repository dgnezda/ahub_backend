import { Injectable } from '@nestjs/common';
import { AuctionItem } from 'entities/auction-item.entity';
import { Bid } from 'entities/bid.entity';
import { DashboardData } from 'interfaces/dashboard.interfaces';
// import { Stats } from 'interfaces/stats.interface';
import { AuctionsService } from 'modules/auctions/auctions.service';
import { BidsService } from 'modules/bids/bids.service';
import { IsNull, Not } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly bidsService: BidsService,
  ) {}

  async getUserDashboard(userId: string): Promise<DashboardData> {
    const userAuctions: AuctionItem[] = await this.auctionsService.findBy({ author: userId }, ['bids', 'bids.user'])
    const userBids: Bid[] = await this.bidsService.findBy({ userId }, ['auction'])
    const completedAuctionsWithWinners = await this.auctionsService.findBy(
      { authorId: userId, is_active: false, winner_id: Not(IsNull()) }
    );

    // Calculate stats
    const earnings: number = completedAuctionsWithWinners.reduce((total, auction) => total + auction.price, 0)
    const stats = {
      totalAuctions: userAuctions.length,
      totalBids: userBids.length,
      activeAuctions: userAuctions.filter(auction => auction.is_active).length,
      earnings,
    }

    return { userAuctions, userBids, stats }
  }
}
