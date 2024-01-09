import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateBidDto } from './dto/create-bid.dto'
import { AbstractService } from 'modules/common/abstract.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Bid } from 'entities/bid.entity'
import { Repository } from 'typeorm'
import Logging from 'lib/Logging'
import { User } from 'entities/user.entity'
import { AuctionItem } from 'entities/auction-item.entity'
import { BidTag } from 'interfaces/bid-tag.interface'

@Injectable()
export class BidsService extends AbstractService {
  constructor(
    @InjectRepository(Bid) private bidsRepository: Repository<Bid>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(AuctionItem) private auctionItemsRepository: Repository<AuctionItem>
    ) {
    super(bidsRepository)
  }

  async create(createBidDto: CreateBidDto, userId: string, auctionItemId: string): Promise<Bid> {
    try {
      const user = (await this.usersRepository.findOne({ where: { id: userId } })) as User
      const auctionItem = (await this.auctionItemsRepository.findOne({ where: { id: auctionItemId } })) as AuctionItem
      const bid = this.bidsRepository.create({...createBidDto, user: user, auction_item: auctionItem, status_tag: BidTag.IN_PROGRESS })
      if (bid.bid_price > auctionItem.price) {
        if (!user.bids) user.bids = []
        if (!auctionItem.bids) auctionItem.bids = []
        user.bids.push(bid)
        auctionItem.bids.push(bid)
        auctionItem.price = bid.bid_price
        this.usersRepository.save(user)
        this.auctionItemsRepository.save(auctionItem)
        return this.bidsRepository.save(bid)
      } else {
        throw new Error('Your bid amount must be larger than current bid amount!')
      }
    } catch (err) {
      Logging.error(err)
      throw new BadRequestException('Something went wrong while creating a new bid.')
    }
  }
}
