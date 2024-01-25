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
      const user = (await this.usersRepository.findOne({ 
        where: { id: userId } 
      })) as User
      const auctionItem = (await this.auctionItemsRepository.findOne({ 
        where: { id: auctionItemId } 
      })) as AuctionItem

      const bid = this.bidsRepository.create({
        ...createBidDto,
        user: user,
        auction_item: auctionItem,
        status_tag: BidTag.IN_PROGRESS,
      })

      if (!bid.is_autobid) bid.max_price = bid.bid_price

      if (bid.bid_price > auctionItem.price) {
        // Save bid info into user, auctionItem
        if (!user.bids) user.bids = []
        if (!auctionItem.bids) auctionItem.bids = []
        user.bids.push(bid)
        auctionItem.bids.push(bid)

        // Handle Auto-bids FIXME: TU SI OSTAL - rešiti highest bid - če highest bid ni auto-bid
        const highestBid = await this.auctionsService.getWinningBid(auctionItem.id)
        if (highestBid.is_autobid === true) { // DO WE REALLY NEED ALL BIDS?? JUST THE HIGHEST!!
          const autoBids = auctionItem.bids.filter(bid => bid.is_autobid === true)
          this.handleAutoBids(bid, autoBids, auctionItem)
        } else {
          ///////////////////////////
        }
        
        if (bid.bid_price >= auctionItem.price) {
          auctionItem.price = bid.bid_price
          this.auctionItemsRepository.save(auctionItem)
          return this.bidsRepository.save(bid)
        } else {
          bid.status_tag = BidTag.OUTBID
          return this.bidsRepository.save(bid)
        }
      } else {
        throw new Error('Your bid amount must be larger than current auction price!')
      }
    } catch (err) {
      Logging.error(err)
      throw new BadRequestException('Something went wrong while creating a new bid.')
    }
  }

  // FIXME: CHECK FOR ERRORS!
  async update(updateBidDto: UpdateBidDto, userId: string, auctionItemId: string): Promise<Bid> {
    try {
      const user = (await this.usersRepository.findOne({ 
        where: { id: userId } 
      })) as User
      const auctionItem = (await this.auctionItemsRepository.findOne({ 
        where: { id: auctionItemId } 
      })) as AuctionItem
      const bid = (await this.bidsRepository.findOne({ 
        where: { user: user, auction_item: auctionItem } 
      })) as Bid
      if (!bid.is_autobid) bid.max_price = bid.bid_price
      if (updateBidDto.bid_price > auctionItem.price) {
        // Handle Auto-bids
        const autoBids = auctionItem.bids.filter(bid => bid.is_autobid === true)
        this.handleAutoBids(bid, autoBids, auctionItem)

        if (bid.bid_price >= auctionItem.price) {
          auctionItem.price = bid.bid_price
        }
        auctionItem.price = updateBidDto.bid_price
        bid.bid_price = updateBidDto.bid_price
        // Update status_tag for winning bid and defeated bids
        bid.status_tag = BidTag.WINNING
        const defeatedBids: Bid[] = auctionItem.bids.filter((bidItem) => bidItem !== bid)
        for (const bidItem of defeatedBids) {
          bidItem.status_tag = BidTag.OUTBID
          this.bidsRepository.save(bidItem)
        }
        this.auctionItemsRepository.save(auctionItem)
        return this.bidsRepository.save(bid)
      } else {
        throw new Error('Your bid amount must be larger than current bid amount!')
      }
    } catch (err) {
      Logging.error(err)
      throw new BadRequestException('Something went wrong while updating a bid.')
    }
  }

  handleAutoBids(currentBid: Bid, bids: Bid[], auctionItem: AuctionItem) {
    // Check for edge cases
    if (bids.length <= 1 && bids[0] === currentBid) return
    if (!bids) return
    // Find highest and second highest bid
    let highestBid: Bid = bids[0]
    let secondHighestBid: Bid = bids[0]
    for (const bid of bids) {
      if (bid.max_price > highestBid.max_price) {
        secondHighestBid = highestBid
        highestBid = bid
      }
    }
    // Handle defeated bids
    const defeatedBids = bids.filter((bid) => bid !== highestBid)
    for (const bid of defeatedBids) {
      if (bid.is_autobid) bid.bid_price = bid.max_price
      bid.status_tag = BidTag.OUTBID
      this.bidsRepository.save(bid)
    }
    // Handle winning bid
    const highestPrice =
      highestBid.increment !== null 
      ? highestBid.increment + secondHighestBid.max_price 
      : highestBid.bid_price
    highestBid.status_tag = BidTag.WINNING
    highestBid.bid_price = highestPrice
    auctionItem.price = highestPrice
    this.bidsRepository.save(highestBid)
    this.auctionItemsRepository.save(auctionItem)
    // return highestBid // NOTE: MAYBE NEED TO RETURN [highestBid, auctionItem]
  }
}
