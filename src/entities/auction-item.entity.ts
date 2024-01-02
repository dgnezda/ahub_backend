import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany } from 'typeorm'
import { Base } from './base.entity'
import { User } from './user.entity'
import { Bid } from './bid.entity'

@Entity()
export class AuctionItem extends Base {
  @ManyToOne(() => User, (user) => user.auctions)
  user: User

  @Column()
  title: string

  @Column()
  is_active: boolean

  @Column()
  description: string

  @Column({ nullable: true })
  image: string

  @Column()
  starting_price: number

  @Column()
  price: number

  @CreateDateColumn()
  @Column({ nullable: true })
  end_date: Date

  @OneToMany(() => Bid, (bid) => bid.auction_item)
  bids: Bid[]
}
