import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  Patch,
  Logger,
  HttpException,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { Public } from 'decorators/public.decorator'
import { RegisterUserDto } from './dto/register-user.dto'
import { User } from 'entities/user.entity'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { RequestWithUser } from 'interfaces/auth.interface'
import { Request, Response } from 'express'
import { ChangePasswordDto } from './dto/change-password.dto'
import { JwtAuthGuard } from './guards/jwt.guard'
import { GetUserId } from 'decorators/get-user-id.decorator'
import { EmailService } from 'modules/email/email.service'

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  @ApiCreatedResponse({ description: 'Registers new user.' })
  @ApiBadRequestResponse({ description: 'Error for registering new user.' })
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterUserDto): Promise<User> {
    return this.authService.register(body)
  }

  @ApiCreatedResponse({ description: 'Logs in user.' })
  @ApiBadRequestResponse({ description: 'Error for logging in a user.' })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response): Promise<User> {
    const access_token = await this.authService.generateJwt(req.user)
    res.cookie('access_token', access_token, { httpOnly: true })
    return req.user
  }

  @ApiCreatedResponse({ description: 'Returns authenticated/logged in user.' })
  @ApiBadRequestResponse({ description: 'Error for returning authenticated/logged in user.' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async user(@Req() req: Request): Promise<User> {
    const cookie = req.cookies['access_token']
    return this.authService.user(cookie)
  }

  @ApiCreatedResponse({ description: 'Signs out user.' })
  @ApiBadRequestResponse({ description: 'Error for signing out user.' })
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(@Res({ passthrough: true }) res: Response): Promise<{ msg: string }> {
    res.clearCookie('access_token')
    return { msg: 'ok' }
  }

  @ApiCreatedResponse({ description: 'Changes user password.' })
  @ApiBadRequestResponse({ description: 'Error for changing user password.' })
  @Patch('change-pw')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() body: ChangePasswordDto, @GetUserId() userId: string): Promise<User> {
    return await this.authService.changeUserPassword(body, userId)
  }

  @ApiCreatedResponse({ description: 'Resets user password.' })
  @ApiBadRequestResponse({ description: 'Error for resetting user password.' })
  @Post('reset-pw')
  @Public()
  @HttpCode(HttpStatus.OK)
  async sendResetPasswordEmail(@Body('email') email: string): Promise<void> {
    const resetToken = await this.authService.generateResetToken(email)
    const resetLink = `https//localhost:8080/reset-pw/${resetToken}`
    const emailTemplate = `
      <p>Hello,</p>
      <p>You have requested to reset your password. Click on the link below to proceed:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you did not request this, pleas ignore this email.</p>
    `
    try {
      await this.emailService.sendMail(email, 'Password Reset Request', emailTemplate)
    } catch (err) {
      Logger.error(err)
      throw new HttpException('Failed to send email', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
