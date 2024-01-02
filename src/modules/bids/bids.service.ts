import { Injectable } from '@nestjs/common'
import { CreateBidDto } from './dto/create-bid.dto'

@Injectable()
export class BidsService {
  create(createBidDto: CreateBidDto) {
    return 'This action adds a new bid'
  }

  findAll() {
    return `This action returns all bids`
  }

  findOne(id: number) {
    return `This action returns a #${id} bid`
  }
}
