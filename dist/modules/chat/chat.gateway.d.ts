import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    constructor(chatService: ChatService);
    server: Server;
    private activeUsers;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, data: any): Promise<void>;
    handleMessage(client: Socket, data: any): Promise<void>;
    handleGetChatHistory(client: Socket, data: any): Promise<void>;
    broadcastFileToRoom(roomId: string, fileUrl: string, fileKey: string): Promise<void>;
}
