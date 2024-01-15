import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, UseGuards, Patch } from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Bid } from 'entities/bid.entity';
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard';
import { GetUserId } from 'decorators/get-user-id.decorator';
import { Public } from 'decorators/public.decorator';
import { AuctionsGateway } from 'modules/auctions/auctions.gateway';

@ApiTags('bids')
@Controller('bids')
export class BidsController {
  constructor(
    private readonly bidsService: BidsService,
    private readonly auctionsGateway: AuctionsGateway
    ) {}

  @ApiCreatedResponse({ description: 'Creates new bid.' })
  @ApiBadRequestResponse({ description: 'Error for creating new bid.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBidDto: CreateBidDto, @GetUserId() userId: string): Promise<Bid> {
    const auctionItemId = createBidDto.auction_item_id
    const bid = await this.bidsService.create(createBidDto, userId, auctionItemId);
    
    return bid
  }

  @ApiCreatedResponse({ description: 'Creates new bid.' }) // *** FIX ***
  @ApiBadRequestResponse({ description: 'Error for creating new bid.' })
  @UseGuards(JwtAuthGuard)
  @Patch()
  @HttpCode(HttpStatus.OK)
  async update(@Body() createBidDto: CreateBidDto, @GetUserId() userId: string): Promise<Bid> {
    const auctionItemId = createBidDto.auction_item_id
    return this.bidsService.update(createBidDto, userId, auctionItemId);
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
    return this.bidsService.findById(id)
  }
}
