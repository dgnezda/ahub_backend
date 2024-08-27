import { AuctionItem } from "entities/auction-item.entity";
import { Bid } from "entities/bid.entity";

export interface DashboardData {
  userAuctions: AuctionItem[];
  userBids: Bid[];
  stats: {
    totalAuctions: number;
    totalBids: number;
    activeAuctions: number;
    earnings: number;
  };
}
