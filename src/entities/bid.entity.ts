import { Column, Entity, ManyToOne } from "typeorm";
import { Base } from "./base.entity";
import { AuctionItem } from "./auction-item.entity";
import { User } from "./user.entity";

@Entity()
export class Bid extends Base {
    @Column()
    bid_price: number

    @ManyToOne(() => AuctionItem, (auctionItem) => auctionItem.bids)
    auction_item: AuctionItem

    @ManyToOne(() => User, (user) => user.bids)
    user: User
}