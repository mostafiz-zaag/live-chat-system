import { Injectable } from '@nestjs/common';
import { AgentService } from '../agents/agent.service';
import { ChatService } from '../chat/chat.service';
import { Room } from '../chat/entities/room.entity';
import { NatsService } from '../nats/nats.service';

@Injectable()
export class UserService {
    constructor(
        private readonly chatService: ChatService,
        private readonly natsService: NatsService,
        private readonly agentService: AgentService,
    ) {}

    async requestAssistance(
        userId: string,
    ): Promise<{ message: string; room: Room }> {
        console.log(`[USER REQUEST] User ${userId} requested assistance.`);

        // Create a unique chat room for the user
        let { message, room: chatRoom } =
            await this.chatService.createRoom(userId);

        // Check for an available agent
        const readyAgent = await this.agentService.getNextAvailableAgent();

        if (readyAgent) {
            // Assign agent to the room immediately
            chatRoom.agentId = readyAgent.agentId;
            chatRoom = await this.chatService.updateRoom(chatRoom);

            // Mark agent as "busy"
            const agent = await this.agentService.markAgentBusy(
                readyAgent.agentId,
            );

            console.log(
                '--------------agent after assigning-----------',
                agent,
            );

            console.log(
                `[USER REQUEST] Assigned Agent ${readyAgent.agentId} to Room ${chatRoom.id}.`,
            );
        } else {
            console.log(
                `[USER REQUEST] No agents available. Room ${chatRoom.id} is waiting.`,
            );
        }

        // Publish user request to NATS JetStream
        await this.natsService.publish('user.request', {
            userId,
            roomId: chatRoom.id,
        });

        return {
            message: `Chat room created. ${readyAgent ? `Agent ${readyAgent.agentId} is assigned.` : `Waiting for an agent.`}`,
            room: chatRoom,
        };
    }

    async getQueueSize(): Promise<{
        queueSize: number;
        waitingRooms: number[];
    }> {
        const queueSizeData = await this.chatService.getWaitingUsers();
        return queueSizeData;
    }
}
