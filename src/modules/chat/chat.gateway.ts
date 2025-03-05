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
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly chatService: ChatService) {}

    @WebSocketServer()
    server: Server;

    private activeUsers = new Map<
        string,
        { userId: string; role: 'user' | 'agent' }
    >();

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.activeUsers.delete(client.id);
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: any,
    ) {
        console.log(`🔵 Received joinRoom event (RAW):`, data);

        // ✅ Force JSON parsing if data is a string
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (error) {
                console.error(`❌ Error: Invalid JSON format. Received:`, data);
                client.emit('error', { message: 'Invalid JSON format.' });
                return;
            }
        }

        // ✅ Check for required fields
        if (!data.roomId || !data.userId) {
            console.error(
                `❌ Error: roomId and userId are required. Received data:`,
                JSON.stringify(data, null, 2),
            );
            client.emit('error', {
                message: 'roomId and userId are required.',
            });
            return;
        }

        const roomIdNum = parseInt(data.roomId, 10);
        if (isNaN(roomIdNum)) {
            console.error(`❌ Error: Invalid room ID format.`);
            client.emit('error', { message: 'Invalid room ID format.' });
            return;
        }

        // ✅ Check if the room exists in the database
        const room = await this.chatService.getRoomById(roomIdNum);
        if (!room) {
            console.error(
                `❌ Error: Room with ID ${roomIdNum} does not exist.`,
            );
            client.emit('error', {
                message: `Room with ID ${roomIdNum} does not exist.`,
            });
            return;
        }

        // ✅ Join the room
        client.join(roomIdNum.toString());
        console.log(`📌 ${data.userId} joined room ${roomIdNum}`);

        client.emit('joinedRoom', {
            roomId: roomIdNum,
            message: `You joined room ${roomIdNum}`,
        });
    }

    // ✅ Sending Messages
    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: any,
    ) {
        console.log('🔵 Received sendMessage event (RAW):', data);

        // ✅ Force JSON parsing if data is a string
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (error) {
                console.error('❌ Error: Invalid JSON format.');
                client.emit('error', { message: 'Invalid JSON format.' });
                return;
            }
        }

        const { roomId, sender, message } = data;

        // ✅ Validate fields
        if (!roomId || !sender || !message) {
            console.error(
                '❌ Error: roomId, sender, and message are required.',
            );
            client.emit('error', {
                message: 'roomId, sender, and message are required.',
            });
            return;
        }

        const roomIdStr = String(roomId); // ✅ Convert roomId to string

        console.log(
            `📩 ${sender} sent message in room ${roomIdStr}: "${message}"`,
        );

        // ✅ Save message to database
        await this.chatService.saveMessage(Number(roomIdStr), sender, message);

        // ✅ Broadcast the message to the room
        this.server.to(roomIdStr).emit('newMessage', { sender, message });
    }

    // ✅ Fetch Chat History
    @SubscribeMessage('getChatHistory')
    async handleGetChatHistory(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: any,
    ) {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (error) {
                console.error('❌ Error: Invalid JSON format.');
                client.emit('error', { message: 'Invalid JSON format.' });
                return;
            }
        }
        const { roomId } = data;

        if (!roomId) {
            client.emit('error', { message: 'roomId is required.' });
            return;
        }

        const messages = await this.chatService.getChatHistory(roomId);
        client.emit('chatHistory', messages);
        console.log(`📜 Sent chat history for room ${roomId}`);
    }
}
