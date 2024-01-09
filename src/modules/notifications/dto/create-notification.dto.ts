import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty } from "class-validator"
import { AuctionItem } from "entities/auction-item.entity"
import { User } from "entities/user.entity"

export class CreateNotificationDto {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    winner: User

    @ApiProperty({ required: true })
    @IsNotEmpty()
    auction_item: AuctionItem
}
