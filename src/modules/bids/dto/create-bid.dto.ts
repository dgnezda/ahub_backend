import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateBidDto {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    bid_price: number

    @ApiProperty({ required: false })
    @IsOptional()
    user_id: string

    @ApiProperty({ required: false })
    @IsOptional()
    auction_item_id: string
}
