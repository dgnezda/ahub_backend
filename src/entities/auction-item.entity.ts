import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany } from 'typeorm'
import { Base } from './base.entity'
import { User } from './user.entity'
import { Bid } from './bid.entity'

@Entity()
export class AuctionItem extends Base {
  @ManyToOne(() => User, user => user.auctions)
  @JoinColumn({ name: 'user_id'})
  user: User

  @Column()
  title: string

  @Column({ nullable: true })
  is_active: boolean

  @Column()
  description: string

  @Column({ nullable: true })
  image: string

  @Column({ nullable: true })
  starting_price: number

  @Column({ nullable: true })
  price: number

  @CreateDateColumn()
  @Column({ nullable: true })
  end_date: Date

  @OneToMany(() => Bid, (bid) => bid.auction_item, { eager: true })
  bids: Bid[]
}
