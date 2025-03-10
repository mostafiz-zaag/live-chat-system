import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../agents/entities/agent.entity'; // Import the Agent entity
import { NATS_CONFIG } from '../config/nats-config';
import { S3ConfigService } from '../config/s3-config';
import { ChatController } from './chat.controller';
import { ChatRepository } from './chat.repository';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { Room } from './entities/room.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message, Room, Agent]), // Add Agent to the array
        ClientsModule.register(NATS_CONFIG),
    ],
    controllers: [ChatController],
    providers: [ChatRepository, ChatService, S3ConfigService],
    exports: [ChatRepository, ChatService],
})
export class ChatModule {}
