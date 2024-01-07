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
      const user = await this.usersRepository.findOne({ where: { id: userId } })
      const auctionItem = this.auctionItemsRepository.create({...createAuctionDto, user: user })
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

  async updateActiveState(): Promise<void> {
    const currentDate = new Date()
    await this.auctionItemsRepository
      .createQueryBuilder()
      .update(AuctionItem)
      .set({ is_active: false })
      .where('end_date < :currentDate', { currentDate })
      .execute()
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

  @Cron('0 * * * * *')
  handleCron() {
    this.updateActiveState()
    console.log('Active state of AuctionItems updated. I do this once every 60s.'); 
  }
}
