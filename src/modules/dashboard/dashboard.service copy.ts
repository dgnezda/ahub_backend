import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuctionItem } from 'entities/auction-item.entity';
import { Bid } from 'entities/bid.entity';
import { User } from 'entities/user.entity';
import { DashboardData } from 'interfaces/dashboard.interfaces';
// import { Stats } from 'interfaces/stats.interface';
import { AuctionsService } from 'modules/auctions/auctions.service';
import { BidsService } from 'modules/bids/bids.service';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // Inject other repositories as needed
  ) {}

  async getUserDashboard(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['user_auctions', 'bids'] // Include relations based on your schema
    });

    if (!user) {
      throw new Error('User not found');
    }

    const dashboardData = {
      totalAuctions: user.user_auctions ? user.user_auctions.length : 0, // this is OK
      totalBidding: 0, // calculate this
      totalWinning: 0, // calculate this
      earnings: 0 // calculate this
    };
    
    dashboardData.earnings = user.user_auctions.reduce((sum, auction) => {
      if (!auction.is_active && new Date(auction.end_date) <= new Date()) {
        return sum + (auction.price || 0);
      }
      return sum;
    }, 0);

    dashboardData.totalWinning = user.bids.filter(bid => {
      const currentAuction = bid.auction_item;
      if (currentAuction.author.id === userId) return false; // User is author, not a win
      const maxBid = Math.max(...currentAuction.bids.map(b => b.bid_price));
      return bid.bid_price === maxBid;
    }).length;

    dashboardData.totalBidding = user.bids.filter(bid => {
      const currentAuction = bid.auction_item;
      return currentAuction.is_active; // If auction is active
    }).length;

    return dashboardData;
  }
}
