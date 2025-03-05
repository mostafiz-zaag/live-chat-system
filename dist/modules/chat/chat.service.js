"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_entity_1 = require("../agents/entities/agent.entity");
const message_entity_1 = require("./entities/message.entity");
const room_entity_1 = require("./entities/room.entity");
let ChatService = class ChatService {
    constructor(roomRepository, messageRepository, agentRepository) {
        this.roomRepository = roomRepository;
        this.messageRepository = messageRepository;
        this.agentRepository = agentRepository;
    }
    async createRoom(userId) {
        console.log(`[CREATE ROOM] Creating chat room for user ${userId}`);
        const readyAgent = await this.agentRepository.findOne({
            where: { status: 'ready' },
        });
        let chatRoom = this.roomRepository.create({
            name: `room_name_${userId}`,
            userId,
            agentId: readyAgent ? readyAgent.agentId : undefined,
        });
        chatRoom = await this.roomRepository.save(chatRoom);
        if (readyAgent) {
            await this.agentRepository.update({ agentId: readyAgent.agentId }, { status: 'busy' });
            console.log(`[CREATE ROOM] Assigned Agent ${readyAgent.agentId} to Room ${chatRoom.id}`);
        }
        else {
            console.log(`[CREATE ROOM] No agents available. Room ${chatRoom.id} is waiting.`);
        }
        return {
            message: `Chat room created. ${readyAgent ? `Agent ${readyAgent.agentId} is assigned.` : `Waiting for an agent.`}`,
            room: chatRoom,
        };
    }
    async updateRoom(chatRoom) {
        return this.roomRepository.save(chatRoom);
    }
    async saveMessage(roomId, sender, content) {
        console.log(`[SAVE MESSAGE] Saving message in Room ID: ${roomId}`);
        const roomIdNum = parseInt(roomId, 10);
        if (isNaN(roomIdNum)) {
            console.error(`[ERROR] Invalid room ID received: ${roomId}`);
            throw new Error(`[ERROR] Invalid room ID received.`);
        }
        const room = await this.roomRepository.findOne({
            where: { id: roomIdNum },
        });
        if (!room) {
            console.error(`[ERROR] Room with ID ${roomIdNum} not found.`);
            throw new Error(`[ERROR] Room with ID ${roomIdNum} not found.`);
        }
        const message = this.messageRepository.create({
            content,
            sender,
            room,
            timestamp: new Date(),
        });
        return this.messageRepository.save(message);
    }
    async getChatHistory(roomId) {
        return this.messageRepository.find({
            where: { room: { id: roomId } },
            order: { timestamp: 'ASC' },
        });
    }
    async assignAgent(roomId, agentId) {
        await this.roomRepository.update({ id: roomId }, { agentId });
    }
    async getWaitingUsers() {
        const waitingRooms = await this.roomRepository.find({
            where: { agentId: (0, typeorm_2.IsNull)() },
        });
        return {
            queueSize: waitingRooms.length,
            waitingRooms: waitingRooms.map((room) => room.id),
        };
    }
    async getRoomById(roomId) {
        return await this.roomRepository.findOne({ where: { id: roomId } });
    }
    async getWaitingRoomByUser(userId) {
        return this.roomRepository.findOne({
            where: { userId, agentId: (0, typeorm_2.IsNull)() },
        });
    }
    async deleteRoom(roomId) {
        await this.roomRepository.delete(roomId);
    }
    async userLeavesChat(userId) {
        const room = await this.roomRepository.findOne({ where: { userId } });
        if (!room) {
            return { message: `No active chat found for user ${userId}.` };
        }
        if (!room.agentId) {
            await this.roomRepository.delete({ id: room.id });
            return {
                message: `User ${userId} has been removed from the queue.`,
            };
        }
        room.userId = null;
        await this.roomRepository.save(room);
        return { message: `User ${userId} has left the chat.` };
    }
    async agentLeavesChat(agentId) {
        await this.agentRepository.update({ agentId }, { status: 'ready' });
        const waitingRoom = await this.roomRepository.findOne({
            where: { agentId: (0, typeorm_2.IsNull)() },
        });
        if (waitingRoom) {
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
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(room_entity_1.Room)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(2, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map