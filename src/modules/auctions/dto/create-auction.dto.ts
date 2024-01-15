import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { Bid } from 'entities/bid.entity'

export class CreateAuctionDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  title: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  description: string

  @ApiProperty({ required: false })
  @IsOptional()
  image?: string

  @ApiProperty({ required: false })
  @IsOptional()
  price?: number

  @ApiProperty({ required: true })
  @IsNotEmpty()
  end_date: Date

  @ApiProperty({ required: false })
  @IsOptional()
  bids?: Bid[] = []
}
