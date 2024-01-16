import { Column, Entity, ManyToOne } from 'typeorm'
import { Base } from './base.entity'
import { User } from './user.entity'
import { AuctionItem } from './auction-item.entity'
import { BidTag } from 'interfaces/bid-tag.interface'

@Entity()
export class Notification extends Base {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User

  @ManyToOne(() => AuctionItem, { onDelete: 'CASCADE' })
  auction_item: AuctionItem

  @Column({ nullable: true })
  read: boolean

  @Column({ nullable: true })
  bid_tag: BidTag
}
