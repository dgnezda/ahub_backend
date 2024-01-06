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
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuctionsService } from './auctions.service'
import { CreateAuctionDto } from './dto/create-auction.dto'
import { UpdateAuctionDto } from './dto/update-auction.dto'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { PaginatedResult } from 'modules/common/interfaces/paginated-result.interface'
import { AuctionItem } from 'entities/auction-item.entity'
import { FileInterceptor } from '@nestjs/platform-express'
import { join, parse } from 'path'
import { isFileExtensionSafe, removeFile, saveImageToStorage } from 'helpers/image-storage'
import { Express, Request } from 'express'
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard'

@ApiTags('auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @ApiCreatedResponse({ description: 'List all auctions.' })
  @ApiBadRequestResponse({ description: 'Error for requesting list of auctions.' })
  @Get()
  // @UseGuards(JwtAuthGuard)
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
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAuctionDto: CreateAuctionDto, @Req() request: Request): Promise<AuctionItem> {
    console.log(request.headers.cookie['user_id'])
    const cookie = parse(request.headers.cookie || '')
    const userId = cookie['user_id']
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
}
