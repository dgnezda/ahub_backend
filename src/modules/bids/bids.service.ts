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
import { UpdateBidDto } from './dto/update-bid.dto'

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
      const bid = this.bidsRepository.create({...createBidDto, user: user, auction_item: auctionItem, status_tag: BidTag.WINNING })
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

  async update(updateBidDto: UpdateBidDto, userId: string, auctionItemId: string): Promise<Bid> {
    const user = (await this.usersRepository.findOne({ where: { id: userId } })) as User
    const auctionItem = (await this.auctionItemsRepository.findOne({ where: { id: auctionItemId } })) as AuctionItem
    const bid = (await this.bidsRepository.findOne({ where: { user: user, auction_item: auctionItem }})) as Bid
    if (updateBidDto.bid_price > auctionItem.price) {
      auctionItem.price = updateBidDto.bid_price
      bid.bid_price = updateBidDto.bid_price
      // Update status_tag for winning bid and defeated bids
      bid.status_tag = BidTag.WINNING
      const defeatedBids: Bid[] = auctionItem.bids.filter(bidItem => bidItem !== bid)
      for (const bidItem of defeatedBids) {
        bidItem.status_tag = BidTag.OUTBID
        this.bidsRepository.save(bidItem)
      }
      this.auctionItemsRepository.save(auctionItem)
      return this.bidsRepository.save(bid)
    } else {
      throw new Error('Your bid amount must be larger than current bid amount!')
    }
  }
}
