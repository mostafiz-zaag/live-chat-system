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

    // Handle agent leaving chat (marks agent as ready and assigns to waiting user if any)
    async agentLeavesChat(agentId: string): Promise<{ message: string }> {
        // Mark the agent as ready
        await this.agentRepository.update({ agentId }, { status: 'ready' });

        // Check if there is a waiting user in the queue
        const waitingRoom = await this.roomRepository.findOne({
            where: { agentId: IsNull() },
        });

        if (waitingRoom) {
            // Assign the ready agent to the waiting user
            waitingRoom.agentId = agentId;
            await this.roomRepository.save(waitingRoom);
            await this.agentRepository.update({ agentId }, { status: 'busy' });

            return {
                message: `Agent ${agentId} has been assigned to waiting user in Room ${waitingRoom.id}.`,
            };
        }

        return {
            message: `Agent ${agentId} is now available for future chats.`,
        };
    }
}
