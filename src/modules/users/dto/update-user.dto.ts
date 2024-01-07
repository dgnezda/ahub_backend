import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional, Matches, ValidateIf } from 'class-validator'
import { Match } from 'decorators/match.decorator'

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  first_name?: string

  @ApiProperty({ required: false })
  @IsOptional()
  last_name?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({ required: false })
  @IsOptional()
  role_id?: string

  @ApiProperty({ required: false })
  @IsOptional()
  avatar?: string

  @ApiProperty({ required: false })
  @ValidateIf((o) => typeof o.password === 'string' && o.password.length > 0)
  @IsOptional()
  @Matches(/^(?=.*\d)[A-Za-z.\s_-]+[\w~@#$%^&*+=`|{}:;!.?"()[\]-]{6,}/, {
    message:
      'Password must have at least one number, lower or uppercase letter, and it has to be longer than 5 characters.',
  })
  password?: string

  @ApiProperty({ required: false })
  @ValidateIf((o) => typeof o.confirm_password === 'string' && o.confirm_password.length > 0)
  @IsOptional()
  @Match(UpdateUserDto, (field) => field.password, { message: 'Passwords do not match.' })
  confirm_password?: string
}
