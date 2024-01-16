import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { Base } from './base.entity'
import { User } from './user.entity'
import { Bid } from './bid.entity'
import { Notification } from './notification.entity'

@Entity()
export class AuctionItem extends Base {
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) //, user => user.auctions
  @JoinColumn({ name: 'user_id' })
  author: User

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

  @Column({ nullable: true })
  winner_id: string

  @OneToMany(() => Notification, (notification) => notification.auction_item)
  notifications: Notification[]
}
