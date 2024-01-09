import { OnModuleInit, UseGuards } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets'
import { GetUserId } from 'decorators/get-user-id.decorator';
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard';
import { Server, Socket } from 'socket.io'

@WebSocketGateway({ 
  cors: { 
    origin: ['http://localhost:3000', 'http://localhost:5173'], 
  } 
})
export class NotificationsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
      this.server.on('connection', socket => {
        console.log(socket.id)
        console.log('Connected');
        
      })
  }
  private readonly connectedClients = new Map<string, Socket>()

  @UseGuards(JwtAuthGuard)
  private extractUserIdFromSocket(socket: Socket, @GetUserId() userId: string): string | null {
    return userId
  }

  getClientByUserId(userId: string): Socket | undefined {
    return this.connectedClients.get(userId)
  }

  @SubscribeMessage('newNotification')
  onNewNotification(@MessageBody() body: any) {
    console.log(body)
    this.server.emit('onNotification', {
      msg: 'New Message',
      content: body,
    })
  }

  @SubscribeMessage('notifyUser')
  notifyUser(@MessageBody() payload: { userId: string; notification: string}): void {
    const { userId, notification } = payload
    const client = this.getClientByUserId(userId)

    if (client) client.emit('notification', notification)
  }
}
