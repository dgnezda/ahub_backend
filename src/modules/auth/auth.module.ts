import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from 'modules/users/users.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt.guard'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: `${configService.get('JWT_SECRET_EXPIRES')}s` },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
