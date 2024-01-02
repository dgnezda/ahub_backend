import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateBidDto } from './dto/create-bid.dto'
import { AbstractService } from 'modules/common/abstract.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Bid } from 'entities/bid.entity'
import { Repository } from 'typeorm'
import Logging from 'lib/Logging'

@Injectable()
export class BidsService extends AbstractService {
  constructor(@InjectRepository(Bid) private readonly bidRepository: Repository<Bid>) {
    super(bidRepository)
  }

  async create(createBidDto: CreateBidDto): Promise<Bid> {
    try {
      const bid = this.bidRepository.create(createBidDto)
      return this.bidRepository.save(bid)
    } catch (err) {
      Logging.error(err)
      throw new BadRequestException('Something went wrong while creating a new bid.')
    }
  }
}
