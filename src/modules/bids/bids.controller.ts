import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Bid } from 'entities/bid.entity';
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard';
import { GetUserId } from 'decorators/get-user-id.decorator';
import { Public } from 'decorators/public.decorator';

@ApiTags('bids')
@Controller('bids')
export class BidsController {
  constructor(
    private readonly bidsService: BidsService
    ) {}

  @ApiCreatedResponse({ description: 'Creates new bid.' })
  @ApiBadRequestResponse({ description: 'Error for creating new bid.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBidDto: CreateBidDto, @GetUserId() userId: string): Promise<Bid> {
    const auctionItemId = createBidDto.auction_item_id
    return this.bidsService.create(createBidDto, userId, auctionItemId);
  }

  @ApiCreatedResponse({ description: 'List all bids.' })
  @ApiBadRequestResponse({ description: 'Error for requesting list of bids.' })
  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return this.bidsService.findAll(['auction_item', 'user']);
  }

  @ApiCreatedResponse({ description: 'Find bid by ID.' })
  @ApiBadRequestResponse({ description: 'Error for requesting bid by ID.' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Bid> {
    return this.bidsService.findById(id);
  }
}
