import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Base } from "./base.entity";
import { AuctionItem } from "./auction-item.entity";
import { User } from "./user.entity";

@Entity()
export class Bid extends Base {
    @Column()
    bid_price: number

    @ManyToOne(() => AuctionItem, { onDelete: 'CASCADE'}) //auctionItem => auctionItem.bids, 
    @JoinColumn({ name: 'auction_item_id' })
    auction_item: AuctionItem

    @ManyToOne(() => User, { onDelete: 'CASCADE'}) // , user => user.bids
    @JoinColumn({ name: 'user_id'})
    user: User
}