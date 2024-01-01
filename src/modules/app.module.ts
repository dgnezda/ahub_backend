import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { AuctionsModule } from './auctions/auctions.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ConfigModule } from '@nestjs/config'
import { configValidationSchema } from 'config/schema.config'
import { DatabaseModule } from 'modules/database/database.module'
import { LoggerMiddleware } from 'middleware/logger.middleware'
import { RolesModule } from './roles/roles.module'
import { PermissionsModule } from './permissions/permissions.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    AuctionsModule,
    RolesModule,
    PermissionsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
