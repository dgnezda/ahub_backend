import { Column, CreateDateColumn, Entity } from 'typeorm'
import { Base } from './base.entity'

@Entity()
export class AuctionItem extends Base {
  @Column()
  user_id: string

  @Column()
  auction_id: string

  @Column()
  title: string

  @Column()
  description: string

  @Column({ nullable: true })
  image: string

  @Column()
  max_price: number

  @CreateDateColumn()
  @Column()
  end_date: Date
}
