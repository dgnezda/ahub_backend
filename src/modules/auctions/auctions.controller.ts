import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common'
import { AuctionsService } from './auctions.service'
import { CreateAuctionDto } from './dto/create-auction.dto'
import { UpdateAuctionDto } from './dto/update-auction.dto'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { PaginatedResult } from 'modules/common/interfaces/paginated-result.interface'
import { AuctionItem } from 'entities/auction-item.entity'
import { FileInterceptor } from '@nestjs/platform-express'
import { join } from 'path'
import { isFileExtensionSafe, removeFile, saveImageToStorage } from 'helpers/image-storage'
import { Express } from 'express'
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard'
import { Public } from 'decorators/public.decorator'
import { GetUserId } from 'decorators/get-user-id.decorator'
import { Bid } from 'entities/bid.entity'
import { BidsService } from 'modules/bids/bids.service'
import { UsersService } from 'modules/users/users.service'

@ApiTags('auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly bidsService: BidsService,
    private readonly usersService: UsersService,
  ) {}

  // CRUD

  @ApiCreatedResponse({ description: 'List all auctions.' })
  @ApiBadRequestResponse({ description: 'Error for requesting list of auctions.' })
  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('page') page: number): Promise<PaginatedResult> {
    return this.auctionsService.paginate(page)
  }

  @ApiCreatedResponse({ description: 'Find auction item by ID.' })
  @ApiBadRequestResponse({ description: 'Error for requesting auction item by ID.' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<AuctionItem> {
    return this.auctionsService.findById(id)
  }

  @ApiCreatedResponse({ description: 'Creates new auction item.' })
  @ApiBadRequestResponse({ description: 'Error for creating new auction item.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAuctionDto: CreateAuctionDto, @GetUserId() userId: string): Promise<AuctionItem> {
    return this.auctionsService.create(createAuctionDto, userId)
  }

  @ApiCreatedResponse({ description: 'Uploads new auction image.' })
  @ApiBadRequestResponse({ description: 'Error for uploading new auction image.' })
  @Post('upload/:id')
  @UseInterceptors(FileInterceptor('image', saveImageToStorage))
  @HttpCode(HttpStatus.CREATED)
  async upload(@UploadedFile() file: Express.Multer.File, @Param('id') auctionId: string): Promise<AuctionItem> {
    const filename = file?.filename

    if (!filename) throw new BadRequestException('File must be a png, jpg/jpeg')

    const imagesFolderPath = join(process.cwd(), 'files')
    const fullImagePath = join(imagesFolderPath + '/' + file.filename)
    if (await isFileExtensionSafe(fullImagePath)) {
      return this.auctionsService.updateAuctionImage(auctionId, filename)
    }
    removeFile(fullImagePath)
    throw new BadRequestException('File content does not match extension!')
  }

  @ApiCreatedResponse({ description: 'Updates an auction.' })
  @ApiBadRequestResponse({ description: 'Error for updating an auction.' })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateAuctionDto: UpdateAuctionDto): Promise<AuctionItem> {
    return this.auctionsService.update(id, updateAuctionDto)
  }

  @ApiCreatedResponse({ description: 'Deletes an auction.' })
  @ApiBadRequestResponse({ description: 'Error for deleting an auction.' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<AuctionItem> {
    return this.auctionsService.remove(id)
  }

  // Helper functions

  @ApiCreatedResponse({ description: 'List all active auctions.' })
  @ApiBadRequestResponse({ description: 'Error for requesting list of active auctions.' })
  @Get('active')
  @Public()
  @HttpCode(HttpStatus.OK)
  async findAllActiveAuctions(): Promise<PaginatedResult> {
    //@Query('page') page: number, status: boolean
    return this.auctionsService.findBy({ where: { is_active: true } })
  }

  @ApiCreatedResponse({ description: 'Find winning bid for auction item by ID.' })
  @ApiBadRequestResponse({ description: 'Error for finding winning bid for auction item by ID.' })
  @Get('winning-bid/:id')
  @HttpCode(HttpStatus.OK)
  async getWinningBid(@Param('id') id: string): Promise<Bid> {
    return this.auctionsService.getWinningBid(id)
  }

  @ApiCreatedResponse({ description: 'Find all bids for auction item by ID.' })
  @ApiBadRequestResponse({ description: 'Error for requesting all bids for auction item by ID.' })
  @Get('all-bids/:id')
  @HttpCode(HttpStatus.OK)
  async getAllBids(@Param('id') id: string): Promise<Bid[]> {
    return this.auctionsService.getAllBids(id)
  }
}
