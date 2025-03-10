import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Room } from './entities/room.entity';
export declare class ChatRepository {
    private readonly roomRepository;
    private readonly messageRepository;
    constructor(roomRepository: Repository<Room>, messageRepository: Repository<Message>);
    createRoom(name: string): Promise<Room>;
    updateRoomAgent(roomId: number, agentId: string): Promise<void>;
    createMessage(roomId: number, sender: string, content: string): Promise<Message>;
    getMessagesByRoomId(roomId: number): Promise<Message[]>;
}
