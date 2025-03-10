import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
    constructor(
        private readonly chatService: ChatService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) {}

    @WebSocketServer()
    server: Server;

    private activeUsers = new Map<
        string,
        { userId: string; role: 'user' | 'agent' }
    >();

    // ✅ Ensure NATS subscriber is initialized when the module starts
    async onModuleInit() {
        console.log(
            `🚀 ChatGateway initialized. Subscribing to NATS events...`,
        );

        await this.natsClient.connect(); // Ensure NATS connection

        // ✅ Subscribe to `file.uploaded` events from NATS
        this.natsClient.send('file.uploaded', {}).subscribe({
            next: (payload) => {
                console.log(`📢 Received NATS event: file.uploaded`, payload);
                this.handleFileUploaded(payload);
            },
            error: (err) =>
                console.error(`❌ Error receiving NATS event: ${err.message}`),
        });
    }

    handleConnection(client: Socket) {
        console.log(`✅ Client connected: ${client.id}`);

        if (!this.server) {
            this.server = client.nsp.server;
            console.log(`🚀 WebSocket server initialized.`);
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`❌ Client disconnected: ${client.id}`);
        this.activeUsers.delete(client.id);
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: any,
    ) {
        console.log(`🔵 Received joinRoom event:`, data);

        try {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }

            if (!data.roomId || !data.userId) {
                client.emit('error', {
                    message: 'roomId and userId are required.',
                });
                return;
            }

            const roomIdNum = parseInt(data.roomId, 10);
            if (isNaN(roomIdNum)) {
                client.emit('error', { message: 'Invalid room ID format.' });
                return;
            }

            const room = await this.chatService.getRoomById(roomIdNum);
            if (!room) {
                client.emit('error', {
                    message: `Room ${roomIdNum} does not exist.`,
                });
                return;
            }

            client.join(roomIdNum.toString());
            console.log(`📌 ${data.userId} joined room ${roomIdNum}`);

            client.emit('joinedRoom', {
                roomId: roomIdNum,
                message: `You joined room ${roomIdNum}`,
            });
        } catch (error) {
            console.error(`❌ Error in joinRoom: ${error.message}`);
            client.emit('error', { message: 'Server error in joinRoom.' });
        }
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: any,
    ) {
        console.log('🔵 Received sendMessage event:', data);

        try {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }

            const { roomId, sender, message } = data;

            if (!roomId || !sender || !message) {
                client.emit('error', {
                    message: 'roomId, sender, and message are required.',
                });
                return;
            }

            const roomIdStr = String(roomId);
            console.log(
                `📩 ${sender} sent message in room ${roomIdStr}: "${message}"`,
            );

            await this.chatService.saveMessage(
                Number(roomIdStr),
                sender,
                message,
            );
            this.server.to(roomIdStr).emit('newMessage', { sender, message });
        } catch (error) {
            console.error(`❌ Error in handleMessage: ${error.message}`);
            client.emit('error', { message: 'Server error in sendMessage.' });
        }
    }

    @EventPattern('file.uploaded')
    handleFileUploaded(payload: { roomId: string; fileUrl: string }) {
        console.log(
            `📢 NATS Event Received: file.uploaded for room ${payload.roomId}`,
        );

        if (!this.server) {
            console.error(`❌ WebSocket server is not initialized.`);
            return;
        }

        console.log(`📢 Broadcasting file to WebSocket room ${payload.roomId}`);

        this.server.to(payload.roomId).emit('newMessage', {
            sender: 'system',
            message: `📎 File uploaded: ${payload.fileUrl}`,
            fileUrl: payload.fileUrl,
        });

        console.log(`✅ WebSocket event sent to room ${payload.roomId}`);
    }
}
