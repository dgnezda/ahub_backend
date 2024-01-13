import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { BidTag } from "interfaces/bid-tag.interface";

export class CreateBidDto {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    bid_price: number

    @ApiProperty({ required: false })
    @IsOptional()
    is_autobid: boolean

    @ApiProperty({ required: false })
    @IsOptional()
    increment: number

    @ApiProperty({ required: false })
    @IsOptional()
    max_price: number

    @ApiProperty({ required: true })
    @IsNotEmpty()
    auction_item_id: string

    @ApiProperty({ required: false })
    @IsOptional()
    status_tag: BidTag
}
