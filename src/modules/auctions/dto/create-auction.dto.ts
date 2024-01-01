import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'

export class CreateAuctionDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  title: string
  
  @ApiProperty({ required: true })
  @IsNotEmpty()
  user_id: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  description: string

  @ApiProperty({ required: false })
  @IsOptional()
  image?: string

  @ApiProperty({ required: false })
  @IsOptional()
  price?: number

  @ApiProperty({ required: false }) // NEEDS TO BE REQUIRED OR PRE-SET
  @IsOptional()
  end_date?: Date
}
