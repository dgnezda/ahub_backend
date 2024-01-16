import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Matches } from 'class-validator'
import { Match } from 'decorators/match.decorator'
import { RegisterUserDto } from './register-user.dto'

export class ChangePasswordDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  old_password: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Matches(/^(?=.*\d)[A-Za-z.\s_-]+[\w~@#$%^&*+=`|{}:;!.?"()[\]-]{6,}/, {
    message:
      'Password must have at least one number, lower or uppercase letter, and it has to be 6 characters or longer.',
  })
  new_password: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Match(RegisterUserDto, (field) => field.password, { message: 'Passwords do not match.' })
  confirm_password: string
}
