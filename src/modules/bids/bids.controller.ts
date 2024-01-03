import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Bid } from 'entities/bid.entity';
// import { UserDecorator } from 'decorators/user.decorator';
// import { User } from 'entities/user.entity';
// import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard';

@ApiTags('bids')
@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @ApiCreatedResponse({ description: 'Creates new bid.' })
  @ApiBadRequestResponse({ description: 'Error for creating new bid.' })
  @Post()
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBidDto: CreateBidDto) { //, @UserDecorator() user: User
    // createBidDto.user_id = user.id
    return this.bidsService.create(createBidDto);
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
