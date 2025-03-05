import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { Message } from './entities/message.entity';
import { Room } from './entities/room.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Room)
        private readonly roomRepository: Repository<Room>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(Agent)
        private readonly agentRepository: Repository<Agent>,
    ) {}

    async createRoom(userId: string): Promise<{ message: string; room: Room }> {
        console.log(`[CREATE ROOM] Creating chat room for user ${userId}`);

        const readyAgent = await this.agentRepository.findOne({
            where: { status: 'ready' },
        });

        // ✅ Fix: Use `name` instead of `userId`
        let chatRoom: Room = this.roomRepository.create({
            name: `room_name_${userId}`, // ✅ Use `name`, not `userId`
            userId, // ✅ Now `userId` exists in the entity
            agentId: readyAgent ? readyAgent.agentId : undefined,
        });

        chatRoom = await this.roomRepository.save(chatRoom);

        if (readyAgent) {
            await this.agentRepository.update(
                { agentId: readyAgent.agentId },
                { status: 'busy' },
            );
            console.log(
                `[CREATE ROOM] Assigned Agent ${readyAgent.agentId} to Room ${chatRoom.id}`,
            );
        } else {
            console.log(
                `[CREATE ROOM] No agents available. Room ${chatRoom.id} is waiting.`,
            );
        }

        return {
            message: `Chat room created. ${readyAgent ? `Agent ${readyAgent.agentId} is assigned.` : `Waiting for an agent.`}`,
            room: chatRoom,
        };
    }

    async updateRoom(chatRoom: Room): Promise<Room> {
        return this.roomRepository.save(chatRoom);
    }

    async saveMessage(
        roomId: number | string,
        sender: string,
        content: string,
    ): Promise<Message> {
        console.log(`[SAVE MESSAGE] Saving message in Room ID: ${roomId}`);

        // ✅ Convert roomId to integer safely
        const roomIdNum = parseInt(roomId as string, 10);

        if (isNaN(roomIdNum)) {
            console.error(`[ERROR] Invalid room ID received: ${roomId}`);
            throw new Error(`[ERROR] Invalid room ID received.`);
        }

        // ✅ Ensure the room exists before saving a message
        const room = await this.roomRepository.findOne({
            where: { id: roomIdNum },
        });

        if (!room) {
            console.error(`[ERROR] Room with ID ${roomIdNum} not found.`);
            throw new Error(`[ERROR] Room with ID ${roomIdNum} not found.`);
        }

        // ✅ Save message only if room exists
        const message = this.messageRepository.create({
            content,
            sender,
            room,
            timestamp: new Date(),
        });

        return this.messageRepository.save(message);
    }

    async getChatHistory(roomId: number): Promise<Message[]> {
        return this.messageRepository.find({
            where: { room: { id: roomId } },
            order: { timestamp: 'ASC' },
        });
    }

    async assignAgent(roomId: number, agentId: string): Promise<void> {
        await this.roomRepository.update({ id: roomId }, { agentId });
    }

    async getWaitingUsers(): Promise<{
        queueSize: number;
        waitingRooms: number[];
    }> {
        const waitingRooms = await this.roomRepository.find({
            where: { agentId: IsNull() }, // ✅ Find all rooms where no agent is assigned
        });

        return {
            queueSize: waitingRooms.length,
            waitingRooms: waitingRooms.map((room) => room.id),
        };
    }

    async getRoomById(roomId: number): Promise<Room | null> {
        return await this.roomRepository.findOne({ where: { id: roomId } });
    }

    async getWaitingRoomByUser(userId: string): Promise<Room | null> {
        return this.roomRepository.findOne({
            where: { userId, agentId: IsNull() }, // Ensuring the user is in queue (agent not assigned)
        });
    }

    async deleteRoom(roomId: number) {
        await this.roomRepository.delete(roomId);
    }

    // Handle user leaving chat (user leaves room or queue)
    async userLeavesChat(userId: string): Promise<{ message: string }> {
        const room = await this.roomRepository.findOne({ where: { userId } });

        if (!room) {
            return { message: `No active chat found for user ${userId}.` };
        }

        if (!room.agentId) {
            // No agent assigned, remove user from the queue
            await this.roomRepository.delete({ id: room.id });
            return {
                message: `User ${userId} has been removed from the queue.`,
            };
        }

        // Agent is assigned, remove user but keep the room open
        room.userId = null;
        await this.roomRepository.save(room);
        return { message: `User ${userId} has left the chat.` };
    }

    async leaveUserChat(userId: string): Promise<{ message: string }> {
        // Step 1: Find the room for the user (whether they're in the queue or in an active chat)
        const chatRoom = await this.roomRepository.findOne({
            where: { userId },
        });

        if (!chatRoom) {
            return { message: `User ${userId} not found in any chat.` };
        }

        // Step 2: If the user has an assigned agent, we need to update the agent status
        if (chatRoom.agentId) {
            // If the user has an agent, we mark the agent as 'ready'
            const agent = await this.agentRepository.findOne({
                where: { agentId: chatRoom.agentId },
            });

            if (agent) {
                await this.agentRepository.update(agent.agentId, {
                    status: 'ready',
                });
                console.log(`Agent ${agent.agentId} is now ready.`);
            }
        }

        // Step 3: Delete the room to remove the user from the queue or active chat
        await this.roomRepository.delete(chatRoom.id);

        console.log(
            `[LEAVE CHAT] User ${userId} has left. Room ${chatRoom.id} deleted.`,
        );

        return { message: `User ${userId} successfully removed from chat.` };
    }

    async leaveAgentChat(
        agentId: string,
    ): Promise<{ message: string; roomId?: number; userId?: string }> {
        console.log(`[LEAVE CHAT] Agent ${agentId} is leaving the chat.`);

        // Find the agent by agentId
        const agent = await this.agentRepository.findOne({
            where: { agentId },
        });

        if (!agent) {
            return { message: `Agent ${agentId} not found.` };
        }

        // Update the agent's status to 'ready'
        await this.agentRepository.update(agent.id, { status: 'ready' });

        console.log(`Agent ${agentId} is now ready.`);

        // Check if there are any users waiting in the queue (rooms with no assigned agent)
        const waitingRooms = await this.roomRepository.find({
            where: { agentId: IsNull() }, // Find all rooms where no agent is assigned
        });

        if (waitingRooms.length > 0) {
            // Assign this agent to the first waiting room
            const waitingRoom = waitingRooms[0]; // Get the first room in the queue
            await this.roomRepository.update(waitingRoom.id, {
                agentId: agent.agentId,
            });

            // Mark the agent as 'busy' since they've been assigned to a user
            await this.agentRepository.update(agent.id, { status: 'busy' });

            console.log(`Assigned Agent ${agentId} to Room ${waitingRoom.id}.`);

            const userId = waitingRoom.userId;

            // Return the room ID along with the message
            return {
                message: `Agent ${agentId} is now ready and assigned to Room ${waitingRoom.id}.`,
                roomId: waitingRoom.id, // Return the room ID that the agent was assigned to
                userId: userId!,
            };
        } else {
            console.log(`No users in queue for Agent ${agentId}.`);
        }

        return {
            message: `Agent ${agentId} is now ready and no users are in the queue.`,
        };
    }
}
