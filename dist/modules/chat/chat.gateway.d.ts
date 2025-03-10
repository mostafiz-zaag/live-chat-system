import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private readonly eventEmitter;
    constructor(chatService: ChatService, eventEmitter: EventEmitter2);
    server: Server;
    private activeUsers;
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, data: any): Promise<void>;
    handleMessage(client: Socket, data: any): Promise<void>;
    handleGetChatHistory(client: Socket, data: any): Promise<void>;
    handleFileUploaded(payload: {
        roomId: string;
        fileUrl: string;
    }): void;
}
