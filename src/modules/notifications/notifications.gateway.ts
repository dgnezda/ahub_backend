import { OnModuleInit } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway(
  Number(process.env.WEBSOCKET_NOTIFICATIONS_PORT),
  { cors: { origin: '*' } }, // ['http://localhost:3000', 'http://localhost:5173'],
)
export class NotificationsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server

  private readonly connectedClients = new Map<string, Socket>()

  onModuleInit() {
    this.server.on('connection', (socket) => {
      const token = socket.handshake.query.token // WHAT DO WITH THIS? VERIFY?
      const userId = this.extractUserIdFromSocket(socket)
      if (userId) {
        this.connectedClients.set(userId, socket)
      }

      socket.on('disconnect', () => {
        if (userId) this.connectedClients.delete(userId)
      })
      console.log(socket.id)
      console.log('Connected')
    })
  }

  extractUserIdFromSocket(socket: Socket) {
    const userId = socket.handshake.query.userId
    if (Array.isArray(userId)) {
      return userId[0]
    }
    return userId as string
  }

  getClientByUserId(userId: string): Socket | undefined {
    return this.connectedClients.get(userId)
  }

  @SubscribeMessage('newNotification')
  onNewNotification(@MessageBody() body: any) {
    console.log(body)
    this.server.emit('onNotification', {
      msg: 'New Notification',
      content: body,
    })
  }

  @SubscribeMessage('notifyUser')
  notifyUser(@MessageBody() payload: { userId: string; notification: string }): void {
    const { userId, notification } = payload
    const client = this.getClientByUserId(userId)
    if (client) client.emit('notification', notification)
  }
}
