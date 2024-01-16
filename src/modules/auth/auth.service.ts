import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from 'entities/user.entity'
import Logging from 'lib/Logging'
import { UsersService } from '../users/users.service'
import { compareHash, hash } from '../../utils/bcrypt'
import { RegisterUserDto } from './dto/register-user.dto'
import { RequestWithUser } from 'interfaces/auth.interface'
import { ChangePasswordDto } from './dto/change-password.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    Logging.info('Validating user...')
    const user = await this.usersService.findBy({ email: email })
    if (!user) {
      throw new BadRequestException('Invalid credentials')
    }
    if (!(await compareHash(password, user.password))) {
      throw new BadRequestException('Invalid credentials')
    }

    Logging.info('User is valid.')
    return user
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const hashedPassword = await hash(registerUserDto.password)
    return this.usersService.create({
      role_id: null,
      ...registerUserDto,
      password: hashedPassword,
    })
  }

  async generateJwt(user: User): Promise<string> {
    return this.jwtService.signAsync({ sub: user.id, name: user.email })
  }

  async generateResetToken(email: string): Promise<string> {
    try {
      const user = await this.usersService.findBy({ email: email })
      return this.jwtService.signAsync({ sub: user.id, name: user.email })
    } catch (err) {
      Logging.error(err)
      throw new BadRequestException(`Cannot find user with email ${email}`)
    }
  }

  async user(cookie: string): Promise<User> {
    const data = await this.jwtService.verifyAsync(cookie)
    return this.usersService.findById(data['id'])
  }

  async getUserId(request: RequestWithUser): Promise<string> {
    const user = request.user as User
    return user.id
  }

  async changeUserPassword(changePasswordDto: ChangePasswordDto, userId: string): Promise<User> {
    return this.usersService.update(userId, {
      password: changePasswordDto.new_password,
      confirm_password: changePasswordDto.confirm_password,
    })
  }
}
