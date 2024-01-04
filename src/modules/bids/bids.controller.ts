import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Bid } from 'entities/bid.entity';
// import { Request } from 'express';
import { parse } from 'path';
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { use } from 'passport';
import { GetUserId } from 'decorators/get-user-id.decorator';

@ApiTags('bids')
@Controller('bids')
export class BidsController {
  constructor(
    private readonly bidsService: BidsService,
    // private readonly jwtService: JwtService
    ) {}

  @ApiCreatedResponse({ description: 'Creates new bid.' })
  @ApiBadRequestResponse({ description: 'Error for creating new bid.' })
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBidDto: CreateBidDto, @GetUserId() userId: string): Promise<Bid> { 
    // const userId = req.params.id
    // const accessToken = req.headers.authorization.split(' ')[1]; // Assuming Bearer token
    // const decodedToken = this.jwtService.verify(accessToken);
    // const user = decodedToken.user;
    // user.id
    console.log(userId)
    const auctionItemId = createBidDto.auction_item_id
    return this.bidsService.create(createBidDto, userId, auctionItemId);
  }

  @ApiCreatedResponse({ description: 'List all bids.' })
  @ApiBadRequestResponse({ description: 'Error for requesting list of bids.' })
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.bidsService.findAll();
  }

  @ApiCreatedResponse({ description: 'Find bid by ID.' })
  @ApiBadRequestResponse({ description: 'Error for requesting bid by ID.' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<Bid> {
    return this.bidsService.findById(id);
  }
}
