import { Exclude } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { Base } from './base.entity'
import { Role } from './role.entity'
import { AuctionItem } from './auction-item.entity'
import { Bid } from './bid.entity'

@Entity()
export class User extends Base {
  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  first_name: string

  @Column({ nullable: true })
  last_name: string

  @Column({ nullable: true })
  avatar: string

  @Column({ nullable: true })
  @Exclude()
  password: string

  @ManyToOne(() => Role, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'role_id' })
  role: Role | null

  @OneToMany(() => AuctionItem, (auctionItem) => auctionItem.id)
  auctions: AuctionItem[]

  @OneToMany(() => Bid, (bid) => bid.user)
  bids: Bid[]
}
