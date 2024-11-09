import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entities/user.entity';
import { Repository } from 'typeorm';

/**
 * Service responsible for aggregating dashboard data for a user.
 */
@Injectable()
export class DashboardService {
  constructor(
    /**
     * Repository for user-related database operations.
     */
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Retrieves dashboard data for a specific user by their ID.
   * 
   * @param userId - The ID of the user to retrieve dashboard data for.
   * @returns A promise resolving to an object containing dashboard statistics.
   */
  async getUserDashboard(userId: string) {
    // Fetch user data including auctions they've created and bids they've placed
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['user_auctions', 'bids', 'bids.auction_item'],
    });

    // Log user data for debugging or analytics
    console.log(user);

    // Check if the user exists
    if (!user) {
      throw new Error('User not found');
    }

    // Logging for development/debugging purposes
    user.user_auctions.forEach(auction => {
      console.log(`Auction end date: ${auction.end_date}, Active: ${auction.is_active}, Price: ${auction.price}`);
    });

    const now = new Date();

    // Calculate earnings from ended auctions authored by the user
    const earnings = user.user_auctions
      .filter(auction => !auction.is_active && auction.end_date < now && auction.price !== null)
      .reduce((sum, auction) => sum + (auction.price || 0), 0);

    // Count the number of auctions where the user has the highest bid but is not the auction's author
    const winningBids = user.bids.filter(bid => 
      bid.auction_item.author.id !== userId && 
      bid.bid_price === Math.max(...bid.auction_item.bids.map(b => b.bid_price || 0))
    );
    const totalWinning = winningBids.length;

    // Count active auctions where the user has placed a bid
    const biddingOnAuctions = user.bids.filter(bid => 
      bid.auction_item.is_active && bid.auction_item.end_date >= now
    );
    const totalBidding = biddingOnAuctions.length;

    // Construct dashboard data object
    const dashboardData = {
      totalAuctions: user.user_auctions.length, // Total number of auctions created by the user
      totalBidding: totalBidding, // Number of active auctions user is bidding on
      totalWinning: totalWinning, // Number of auctions user is currently winning
      earnings: earnings, // Total earnings from auctions won by other users
    };

    return dashboardData;
  }
}