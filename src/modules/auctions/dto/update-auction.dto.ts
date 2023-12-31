import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class UpdateAuctionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  title?: string

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string

  @ApiProperty({ required: false })
  @IsOptional()
  image?: string

  @ApiProperty({ required: false })
  @IsOptional()
  end_date?: Date
}
