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
import { AuctionsService } from 'modules/auctions/auctions.service'

@Injectable()
export class BidsService extends AbstractService {
  constructor(
    @InjectRepository(Bid) private bidsRepository: Repository<Bid>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(AuctionItem) private auctionItemsRepository: Repository<AuctionItem>,
    private readonly auctionsService: AuctionsService,
  ) {
    super(bidsRepository)
  }

  async create(createBidDto: CreateBidDto, userId: string, auctionItemId: string): Promise<Bid> {
    try {
      const user = await this.usersRepository.findOneOrFail({ where: { id: userId } })
      const auctionItem = await this.auctionItemsRepository.findOneOrFail({ where: { id: auctionItemId } })
  
      // Ensure auction has not expired
      if (auctionItem.end_date < new Date()) {
        throw new BadRequestException('The auction has expired!')
      }
  
      if (createBidDto.bid_price <= auctionItem.price) {
        throw new BadRequestException('Your bid amount must be larger than the current auction price!')
      }
  
      const bid = this.bidsRepository.create({
        ...createBidDto,
        user: user,
        auction_item: auctionItem,
        status_tag: BidTag.IN_PROGRESS,
      })
  
      if (!bid.is_autobid) bid.max_price = bid.bid_price
  
      if (!user.bids) user.bids = []
      if (!auctionItem.bids) auctionItem.bids = []
      user.bids.push(bid)
      auctionItem.bids.push(bid)
  
      const currentHighestBid = await this.auctionsService.getWinningBid(auctionItem.id)
  
      if (currentHighestBid) {
        if (currentHighestBid.is_autobid) {
          // Auto-bid scenario
          const autoBids = auctionItem.bids.filter(bid => bid.is_autobid)
          await this.handleAutoBids(bid, autoBids, auctionItem)
        } else {
          // Normal bid scenario
          currentHighestBid.status_tag = BidTag.OUTBID
          await this.bidsRepository.save(currentHighestBid)
  
          if (bid.bid_price > auctionItem.price) {
            auctionItem.price = bid.bid_price
            bid.status_tag = BidTag.WINNING
            await this.auctionItemsRepository.save(auctionItem)
          } else {
            bid.status_tag = BidTag.OUTBID
          }
          await this.bidsRepository.save(bid)
        }
      } else {
        auctionItem.price = bid.bid_price
        bid.status_tag = BidTag.WINNING
        await this.auctionItemsRepository.save(auctionItem)
        await this.bidsRepository.save(bid)
      }
  
      return bid
    } catch (err) {
      Logging.error(err)
      throw new BadRequestException('Something went wrong while creating a new bid.')
    }
  }
  

  async update(updateBidDto: UpdateBidDto, userId: string, auctionItemId: string): Promise<Bid> {
    // Assuming update is only for auto-bids and bid price changes
    try {
      const user = await this.usersRepository.findOneOrFail({ where: { id: userId } })
      const auctionItem = await this.auctionItemsRepository.findOneOrFail({ where: { id: auctionItemId } })
      const bid = await this.bidsRepository.findOneOrFail({ where: { user: user, auction_item: auctionItem } })

      if (!bid.is_autobid) bid.max_price = bid.bid_price

      if (updateBidDto.bid_price > auctionItem.price) {
        const autoBids = auctionItem.bids.filter(bid => bid.is_autobid)
        await this.handleAutoBids(bid, autoBids, auctionItem)

        bid.bid_price = updateBidDto.bid_price
        auctionItem.price = updateBidDto.bid_price
        bid.status_tag = BidTag.WINNING

        const defeatedBids = auctionItem.bids.filter(bidItem => bidItem !== bid)
        for (const bidItem of defeatedBids) {
          bidItem.status_tag = BidTag.OUTBID
          await this.bidsRepository.save(bidItem)
        }
        await this.auctionItemsRepository.save(auctionItem)
        return await this.bidsRepository.save(bid)
      } else {
        throw new BadRequestException('Your bid amount must be larger than current bid amount!')
      }
    } catch (err) {
      Logging.error(err)
      throw new BadRequestException('Something went wrong while updating a bid.')
    }
  }

  private async handleAutoBids(currentBid: Bid, autoBids: Bid[], auctionItem: AuctionItem) {
    if (autoBids.length === 0) return
  
    // Find highest and second highest bid
    let highestBid = autoBids[0]
    let secondHighestBid = autoBids[0]
  
    for (const bid of autoBids) {
      if (bid.max_price > highestBid.max_price) {
        secondHighestBid = highestBid
        highestBid = bid
      }
    }
  
    const defeatedBids = autoBids.filter(bid => bid !== highestBid)
    for (const bid of defeatedBids) {
      bid.bid_price = bid.max_price
      bid.status_tag = BidTag.OUTBID
      await this.bidsRepository.save(bid)
    }
  
    // Determine the new highest price
    const highestPrice = highestBid.increment
      ? Math.min(highestBid.max_price, highestBid.increment + (secondHighestBid?.max_price ?? 0))
      : highestBid.bid_price
  
    // Resolve ties by creation date
    const highestBids = autoBids.filter(bid => bid.max_price === highestPrice)
    if (highestBids.length > 1) {
      highestBid = highestBids.reduce((earliest, bid) => bid.created_at < earliest.created_at ? bid : earliest, highestBids[0])
    }
  
    highestBid.status_tag = BidTag.WINNING
    highestBid.bid_price = highestPrice
    auctionItem.price = highestPrice
  
    await this.bidsRepository.save(highestBid)
    await this.auctionItemsRepository.save(auctionItem)
  } 
}
