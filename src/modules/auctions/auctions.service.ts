import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { CreateAuctionDto } from './dto/create-auction.dto'
import { UpdateAuctionDto } from './dto/update-auction.dto'
import { AbstractService } from 'modules/common/abstract.service'
import { InjectRepository } from '@nestjs/typeorm'
import { AuctionItem } from 'entities/auction-item.entity'
import { Repository } from 'typeorm'
import Logging from 'lib/Logging'
import { User } from 'entities/user.entity'
import { Cron } from '@nestjs/schedule'
import { Bid } from 'entities/bid.entity'
import { BidTag } from 'interfaces/bid-tag.interface'

@Injectable()
export class AuctionsService extends AbstractService {
  constructor(
    @InjectRepository(AuctionItem) private readonly auctionItemsRepository: Repository<AuctionItem>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Bid) private bidsRepository: Repository<Bid>,
  ) {
    super(auctionItemsRepository)
  }

  async create(createAuctionDto: CreateAuctionDto, userId: string): Promise<AuctionItem> {
    try {
      let endDate = createAuctionDto.end_date
      if (!endDate) {
        // if no endDate is set, set it to 7 days from now
        endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
      }
      const user = await this.usersRepository.findOne({ where: { id: userId } })
      const auctionItem = this.auctionItemsRepository.create({...createAuctionDto, author: user })
      return this.auctionItemsRepository.save(auctionItem)
    } catch (err) {
      Logging.error(err)
      throw new BadRequestException('Something went wrong while creating a new auction item.')
    }
  }

  async update(id: string, updateAuctionDto: UpdateAuctionDto): Promise<AuctionItem> {
    const auctionItem = (await this.findById(id)) as AuctionItem
    try {
      auctionItem.title = updateAuctionDto.title
      auctionItem.description = updateAuctionDto.description
      auctionItem.image = updateAuctionDto.image
      auctionItem.end_date = updateAuctionDto.end_date
      return this.auctionItemsRepository.save(auctionItem)
    } catch (err) {
      Logging.error(err)
      throw new InternalServerErrorException('Something went wrong while updating the auction item')
    }
  }

  async updateAuctionImage(id: string, image: string): Promise<AuctionItem> {
    const auctionItem = await this.findById(id)
    return this.update(auctionItem.id, { ...auctionItem, image })
  }

  async handleAuctionsExpiration(): Promise<void> {
    const currentDate = new Date()

    const itemsToUpdate = await this.auctionItemsRepository
      .createQueryBuilder()
      .select()
      .where('end_date < :currentDate', { currentDate })
      .andWhere('active = :isActive', { isActive: true})
      .getMany()

    for (const auctionItem of itemsToUpdate) {
      auctionItem.is_active = false
      await this.auctionItemsRepository.save(auctionItem)
      this.handleAuctionBidsOnAuctionEnd(auctionItem)
    }
    
    // FIRST VERSION:
    // await this.auctionItemsRepository
    //   .createQueryBuilder()
    //   .update(AuctionItem)
    //   .set({ is_active: false })
    //   .where('end_date < :currentDate', { currentDate })
    //   .execute()
  }

  // FIXME: COMPLETE THIS! NOTIFY AUTHOR AND BIDDERS
  async handleAuctionBidsOnAuctionEnd(auctionItem: AuctionItem): Promise<void> {
    const author: User = auctionItem.author
    const bidders: User[] = []
    const bids = auctionItem.bids
    let winner: User;
    for (const bid of bids) {
      if (bid.user.id === auctionItem.winner_id) {
        bid.status_tag = BidTag.WON
        winner = bid.user
      } else {
        bid.status_tag = BidTag.OUTBID
        bidders.push(bid.user)
      }
      
    }
    
    // const endDate = auctionItem.end_date
  }

  async getAllBids(id: string): Promise<Bid[]> {
    const auction = await this.auctionItemsRepository.findOne({ where: { id: id } })
    return auction.bids
  }

  async getWinningBid(id: string): Promise<Bid> {
    const auction = await this.auctionItemsRepository.findOne({ where: { id: id } })
    const winningBid = auction.bids.find((bid) => bid.bid_price === auction.price )
    return winningBid
  }
  
  // NOTE: MAYBE NEEDED ON THE FRONT_END?
  async calculateAuctionTimeRemaining(auctionId: string): Promise<string> {
    const currentTime = new Date().getTime()
    const endTime = (
      await this.auctionItemsRepository.findOne({ where: { id: auctionId } })
      )
      ?.end_date.getTime()

    if (!endTime || endTime <= currentTime) '0s'

    const timeRemaining = endTime - currentTime;
    const millisecondsPerMinute = 60 * 1000
    const millisecondsPerHour = 60 * millisecondsPerMinute
    const millisecondsPerDay = 24 * millisecondsPerHour

    if (timeRemaining >= 2 * millisecondsPerDay) {
      return `${Math.floor(timeRemaining / millisecondsPerDay)}d`
    } else if (timeRemaining >= millisecondsPerHour) {
      return `${Math.floor(timeRemaining / millisecondsPerHour)}h`
    } else if (timeRemaining >= millisecondsPerMinute) {
      return `${Math.floor(timeRemaining / millisecondsPerMinute)}m`
    } else {
      return `${Math.floor(timeRemaining / 1000)}s`
    }
  }

  // @Cron('0 * * * * *')
  // handleCron() {
  //   this.handleAuctionsExpiration() // NOTE: get number of AuctionItems that were updated
  //   console.log('Active state of AuctionItems updated. Bidding users notified. Runs once a minute at the 0s mark.'); 
  // }
}
