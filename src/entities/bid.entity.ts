import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Base } from "./base.entity";
import { AuctionItem } from "./auction-item.entity";
import { User } from "./user.entity";
import { BidTag } from "interfaces/bid-tag.interface";

@Entity()
export class Bid extends Base {
    @Column({ nullable: true })
    bid_price: number

    @ManyToOne(() => AuctionItem, { onDelete: 'CASCADE'}) //auctionItem => auctionItem.bids, 
    @JoinColumn({ name: 'auction_item_id' })
    auction_item: AuctionItem

    @ManyToOne(() => User, { onDelete: 'CASCADE'}) // , user => user.bids
    @JoinColumn({ name: 'user_id'})
    user: User

    @Column({ nullable: true })
    status_tag: BidTag
}