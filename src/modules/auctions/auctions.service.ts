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
import { NotificationsService } from 'modules/notifications/notifications.service'
// import { audit } from 'rxjs'

@Injectable()
export class AuctionsService extends AbstractService {
  constructor(
    @InjectRepository(AuctionItem) private readonly auctionItemsRepository: Repository<AuctionItem>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Bid) private bidsRepository: Repository<Bid>,
    private readonly notificationsService: NotificationsService,
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
      const auctionItem = this.auctionItemsRepository.create({ ...createAuctionDto, author: user })
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

  async getAllBids(id: string): Promise<Bid[]> {
    const auction = await this.auctionItemsRepository.findOne({ where: { id: id }, relations: ['bids'] })
    return auction.bids
  }

  async getWinningBid(id: string): Promise<Bid> {
    const auction = await this.auctionItemsRepository.findOne({ where: { id: id }, relations: ['bids'] })
    const winningBid = auction.bids.find((bid) => bid.bid_price === auction.price)
    return winningBid
  }

  // On Expiration of Auctions
  async handleAuctionsExpiration(): Promise<void> {
    const currentDate = new Date()

    const auctionItemsToUpdate = await this.auctionItemsRepository
      .createQueryBuilder('auctionItem')
      .leftJoinAndSelect('auctionItem.bids', 'bid')
      .leftJoinAndSelect('auctionItem.author', 'author')
      .where('auctionItem.end_date < :currentDate', { currentDate })
      .andWhere('auctionItem.is_active = :isActive', { isActive: true })
      .getMany();

    if (auctionItemsToUpdate.length === 0) return console.log('0')

    const numberOfAuctionItems = auctionItemsToUpdate.length

    for (const auctionItem of auctionItemsToUpdate) {
      auctionItem.is_active = false
    }
    await this.auctionItemsRepository.save(auctionItemsToUpdate)
    
    for (const auctionItem of auctionItemsToUpdate) {
      this.handleAuctionBidsOnAuctionEnd(auctionItem)
    }

    console.log(`[${numberOfAuctionItems}] auction items have expired.`)
  }

  async handleAuctionBidsOnAuctionEnd(auctionItem: AuctionItem): Promise<void> {
    const author: User = auctionItem.author;
    const usersToNotify: User[] = [author];
    const bids = auctionItem.bids;

    for (const bid of bids) {
        bid.status_tag = bid.user.id === auctionItem.winner_id ? BidTag.WON : BidTag.OUTBID;
        await this.bidsRepository.save(bid);
        usersToNotify.push(bid.user);
    }

    await this.notificationsService.notifyUsers(usersToNotify, auctionItem, bids);
  }


  // NOTE: MAYBE NEEDED ON THE FRONT_END?
  async calculateAuctionTimeRemaining(auctionId: string): Promise<string> {
    const currentTime = new Date().getTime()
    const endTime = (await this.auctionItemsRepository.findOne({ where: { id: auctionId } }))?.end_date.getTime()

    if (!endTime || endTime <= currentTime) '0s'

    const timeRemaining = endTime - currentTime
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

  @Cron('0 * * * * *') // WHY YOU RUN TWICE PER MINUTE??
  handleCron() {
    this.handleAuctionsExpiration()
  }
}
