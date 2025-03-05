import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../agents/entities/agent.entity'; // Import the Agent entity
import { ChatController } from './chat.controller';
import { ChatRepository } from './chat.repository';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { Room } from './entities/room.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message, Room, Agent]), // Add Agent to the array
    ],
    controllers: [ChatController],
    providers: [ChatRepository, ChatService],
    exports: [ChatRepository, ChatService],
})
export class ChatModule {}
