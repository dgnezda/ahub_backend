import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateUpdateRoleDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'There should be at least one permission selected' })
  permissions: string[]
}
