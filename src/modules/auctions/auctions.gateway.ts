// auction.gateway.ts
import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AuctionsService } from './auctions.service'

@WebSocketGateway(
    Number(process.env.WEBSOCKET_AUCTIONS_PORT), 
    { cors: { origin: ['http://localhost:3000', 'http://localhost:5173'], } }, // '*'
)
export class AuctionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly auctionsService: AuctionsService) {}

    handleConnection(client: Socket, ...args: any[]) {
        // Handle new Socket connection
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        // Handle Socket disconnection
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('subscribeToAuction')
    handleSubscribeToAuction(client: Socket, payload: { auctionId: string }) {
        // Subscribe to auction updates for the given auctionId
        const auctionId = payload.auctionId;
        client.join(auctionId);
        this.sendTimeRemainingUpdates(auctionId);
    }

    sendTimeRemainingUpdates(auctionId: string) {
        const intervalId = setInterval(() => {
            const timeRemaining = this.auctionsService.calculateAuctionTimeRemaining(auctionId);
            this.server.to(auctionId).emit('timeRemainingUpdate', { auctionId, timeRemaining });

            const room = this.server.sockets.adapter.rooms.get(auctionId);
            const connectedClients = room ? room.size : 0;

            if (connectedClients === 0) {
                clearInterval(intervalId);
            }
        }, 1000);
    }
}
  