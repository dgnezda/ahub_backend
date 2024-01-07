import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { User } from 'entities/user.entity'
import { isFileExtensionSafe, removeFile, saveImageToStorage } from '../../helpers/image-storage'
import { PaginatedResult } from '../../interfaces/paginated-result.interface'
import { join } from 'path'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'
import { Bid } from 'entities/bid.entity'
import { AuctionsService } from 'modules/auctions/auctions.service'
import { GetUser } from 'decorators/get-user.decorator'
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard'
import { AuctionItem } from 'entities/auction-item.entity'

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auctionsService: AuctionsService,
  ) {}

  @ApiCreatedResponse({ description: 'List all users.' })
  @ApiBadRequestResponse({ description: 'Error for list of users.' })
  @Get()
  // @HasPermission('users')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('page') page: number): Promise<PaginatedResult> {
    return this.usersService.paginate(page, ['role'])
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id)
  }

  @ApiCreatedResponse({ description: 'Creates new user.' })
  @ApiBadRequestResponse({ description: 'Error for creating a new user.' })
  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto)
  }

  @Post('upload/:id')
  @UseInterceptors(FileInterceptor('avatar', saveImageToStorage))
  @HttpCode(HttpStatus.CREATED)
  async upload(@UploadedFile() file: Express.Multer.File, @Param('id') id: string): Promise<User> {
    const filename = file?.filename

    if (!filename) throw new BadRequestException('File must be a png, jpg/jpeg')

    const imagesFolderPath = join(process.cwd(), 'files')
    const fullImagePath = join(imagesFolderPath + '/' + file.filename)
    if (await isFileExtensionSafe(fullImagePath)) {
      return this.usersService.upadteUserImageId(id, filename)
    }
    removeFile(fullImagePath)
    throw new BadRequestException('File content does not match extension!')
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id)
  }

  @ApiCreatedResponse({ description: 'Get all bids for user.' })
  @ApiBadRequestResponse({ description: 'Error for getting bids for user.' })
  @Get('bids/:id')
  @HttpCode(HttpStatus.OK)
  async getBids(user: User): Promise<Bid[]> {
    const bids = user.bids
    return bids
  }

  @ApiCreatedResponse({ description: 'Get all bids a user has won.' })
  @ApiBadRequestResponse({ description: 'Error for getting all bids a user has won.' })
  @UseGuards(JwtAuthGuard)
  @Get('bids/won')
  @HttpCode(HttpStatus.OK)
  async getBidsWon(@GetUser() user: User): Promise<Bid[]> {
    const uniqueAuctionsBid: AuctionItem[] = [...new Set(user.bids.map(bid => bid.auction_item))]
    const auctionWinnerIds: string[] = uniqueAuctionsBid.map(auction => auction.winner_id)
    let bidsWon: Bid[] = []
    for (let auctionId of auctionWinnerIds) {
      if (user.id === auctionId) {
        const winningBid = await this.auctionsService.getWinningBidForAuction(auctionId)
        bidsWon.push(winningBid)
      }
    }
    return bidsWon
  }


}
