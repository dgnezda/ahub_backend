import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { CreateAuctionDto } from './dto/create-auction.dto'
import { UpdateAuctionDto } from './dto/update-auction.dto'
import { AbstractService } from 'modules/common/abstract.service'
import { InjectRepository } from '@nestjs/typeorm'
import { AuctionItem } from 'entities/auction-item.entity'
import { Repository } from 'typeorm'
import Logging from 'lib/Logging'
import { User } from 'entities/user.entity'

@Injectable()
export class AuctionsService extends AbstractService {
  constructor(
    @InjectRepository(AuctionItem) private readonly auctionItemRepository: Repository<AuctionItem>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super(auctionItemRepository)
  }

  async create(createAuctionDto: CreateAuctionDto, userId: string): Promise<AuctionItem> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } })
      const auctionItem = this.auctionItemRepository.create({...createAuctionDto, user: user })
      return this.auctionItemRepository.save(auctionItem)
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
      return this.auctionItemRepository.save(auctionItem)
    } catch (err) {
      Logging.error(err)
      throw new InternalServerErrorException('Something went wrong while updating the auction item')
    }
  }

  async updateAuctionImage(id: string, image: string): Promise<AuctionItem> {
    const auctionItem = await this.findById(id)
    return this.update(auctionItem.id, { ...auctionItem, image })
  }
}
