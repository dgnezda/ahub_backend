import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreatePermissionDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string
}
