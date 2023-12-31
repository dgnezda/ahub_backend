import { Column, CreateDateColumn, Entity } from 'typeorm'
import { Base } from './base.entity'

@Entity()
export class AuctionItem extends Base {
    @Column()
    title: string

    @Column()
    description: string

    @Column({ nullable: true })
    image: string

    @Column()
    price: number

    @CreateDateColumn()
    @Column()
    end_date: Date
}