import { OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    private readonly chatService;
    private readonly natsClient;
    constructor(chatService: ChatService, natsClient: ClientProxy);
    server: Server;
    private activeUsers;
    onModuleInit(): Promise<void>;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, data: any): Promise<void>;
    handleMessage(client: Socket, data: any): Promise<void>;
    handleFileUploaded(payload: {
        roomId: string;
        fileUrl: string;
    }): void;
}
