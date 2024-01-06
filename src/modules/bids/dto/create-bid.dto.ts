import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateBidDto {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    bid_price: number

    @ApiProperty({ required: true })
    @IsNotEmpty()
    auction_item_id: string
}
