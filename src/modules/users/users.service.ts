import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { error } from 'console'
import { User } from 'entities/user.entity'
import { PostgresErrorCode } from '../../helpers/postgres-error-code.enum'
import Logging from 'lib/Logging'
import { AbstractService } from 'modules/common/abstract.service'
import { Repository } from 'typeorm'
import { compareHash, hash } from '../../utils/bcrypt'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService extends AbstractService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {
    super(usersRepository)
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findBy({ email: createUserDto.email })
    if (user) {
      throw new BadRequestException(`User with email ${createUserDto.email} already exists.`)
    }
    try {
      const newUser = this.usersRepository.create({ ...createUserDto }) // to use roles add , role: { id: createUserDto.role_id }  after ...createUserDto
      newUser.auctions = []
      newUser.bids = []
      return this.usersRepository.save(newUser)
    } catch (err) {
      Logging.error(error)
      throw new BadRequestException('Something went wrong while creating a new user.')
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = (await this.findById(id)) as User
    const { email, password, confirm_password, ...data } = updateUserDto // to use roles add , role_id,   after confirm_pw
    if (user.email !== email && email) {
      user.email = email
    }
    if (password && confirm_password) {
      if (password !== confirm_password) {
        throw new BadRequestException('Passwords do not match')
      }
      if (await compareHash(password, user.password)) {
        throw new BadRequestException('New password cannot be the same as old password.')
      }
      user.password = await hash(password)
    }
    // if (role_id) {
    //   user.role = { ...user.role, id: role_id }
    // }
    try {
      Object.entries(data).map((entry) => {
        user[entry[0]] = entry[1]
      })
      return this.usersRepository.save(user)
    } catch (err) {
      Logging.error(err)
      if (err?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User with that email already exists.')
      }
      throw new InternalServerErrorException('Something went wrong while updating the user.')
    }
  }

  async upadteUserImageId(id: string, avatar: string): Promise<User> {
    const user = await this.findById(id)
    return this.update(user.id, { avatar })
  }
}
