import { Controller, Post, UseGuards, BadRequestException } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { NotificationsGateway } from './notifications.gateway'
import { GetUserId } from 'decorators/get-user-id.decorator'
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard'
import Logging from 'lib/Logging'

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly eventsGateway: NotificationsGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('clear')
  clearNotifications(@GetUserId() userId: string) {
    try {
      if (userId) {
        this.notificationsService.clearNotificationsForUser(userId)
        const client = this.eventsGateway.getClientByUserId(userId)
        if (client) client.emit('notificationsCleared')
        return { message: 'Notifications cleared successfully' }
      }
    } catch (err) {
      Logging.error(err)
      throw new BadRequestException('Something went wrong while trying to clear notifications.')
    }
  }
}
