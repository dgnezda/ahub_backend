import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'

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
  @IsNotEmpty()
  price: number

  @ApiProperty({ required: false })
  @IsNotEmpty()
  end_date: Date
}
