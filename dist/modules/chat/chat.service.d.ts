import { OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { S3ConfigService } from '../config/s3.config';
import { Message } from './entities/message.entity';
import { Room } from './entities/room.entity';
export declare class ChatService implements OnModuleInit {
    private readonly roomRepository;
    private readonly messageRepository;
    private readonly agentRepository;
    private eventEmitter;
    private readonly s3ConfigService;
    constructor(roomRepository: Repository<Room>, messageRepository: Repository<Message>, agentRepository: Repository<Agent>, eventEmitter: EventEmitter2, s3ConfigService: S3ConfigService);
    onModuleInit(): void;
    uploadFile(file: Express.Multer.File, roomId: string, senderType: string): Promise<{
        fileUrl: string;
        fileKey: string;
    }>;
    createRoom(userId: string): Promise<{
        message: string;
        room: Room;
    }>;
    updateRoom(chatRoom: Room): Promise<Room>;
    saveMessage(roomId: number | string, sender: string, content: string): Promise<Message>;
    getChatHistory(roomId: number): Promise<Message[]>;
    assignAgent(roomId: number, agentId: string): Promise<void>;
    getWaitingUsers(): Promise<{
        queueSize: number;
        waitingRooms: {
            roomId: number;
            userId: string;
            roomName: string;
        }[];
    }>;
    getRoomById(roomId: number): Promise<Room | null>;
    getWaitingRoomByUser(userId: string): Promise<Room | null>;
    deleteRoom(roomId: number): Promise<void>;
    userLeavesChat(userId: string): Promise<{
        message: string;
    }>;
    leaveUserChat(userId: string): Promise<{
        message: string;
    }>;
    leaveAgentChat(agentId: string): Promise<{
        message: string;
        roomId?: number;
        userId?: string;
    }>;
}
