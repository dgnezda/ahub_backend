import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateBidDto } from './dto/create-bid.dto'
import { AbstractService } from 'modules/common/abstract.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Bid } from 'entities/bid.entity'
import { Repository } from 'typeorm'
import Logging from 'lib/Logging'
import { User } from 'entities/user.entity'
import { AuctionItem } from 'entities/auction-item.entity'

@Injectable()
export class BidsService extends AbstractService {
  constructor(
    @InjectRepository(Bid) private bidRepository: Repository<Bid>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(AuctionItem) private auctionItemRepository: Repository<AuctionItem>
    ) {
    super(bidRepository)
  }

  async create(createBidDto: CreateBidDto): Promise<Bid> {
    try {
      const user = await this.userRepository.findOneBy({id: createBidDto.user_id})
      const auctionItem = await this.auctionItemRepository.findOneBy({ id: createBidDto.auction_item_id})
      const bid = this.bidRepository.create(createBidDto)
      this.userRepository.save({...user, ...bid})
      this.auctionItemRepository.save({...auctionItem, ...bid})
      return this.bidRepository.save(bid)
    } catch (err) {
      Logging.error(err)
      throw new BadRequestException('Something went wrong while creating a new bid.')
    }
  }
}
