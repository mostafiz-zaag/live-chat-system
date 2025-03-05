import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from '../chat/chat.module'; // Import ChatModule to get `RoomRepository`
import { Room } from '../chat/entities/room.entity'; // Import Room entity
import { NatsModule } from '../nats/nats.module';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { Agent } from './entities/agent.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Agent, Room]), // Ensure `AgentRepository` and `RoomRepository` are available
        NatsModule, // Ensures `NATS_SERVICE` is available
        ChatModule, // Ensures `RoomRepository` is accessible
    ],
    controllers: [AgentController],
    providers: [AgentService],
    exports: [AgentService, TypeOrmModule], // Ensure `AgentService` is accessible in `ChatModule`
})
export class AgentModule {}
