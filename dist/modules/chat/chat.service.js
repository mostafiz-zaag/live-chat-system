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
const microservices_1 = require("@nestjs/microservices");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const agent_entity_1 = require("../agents/entities/agent.entity");
const s3_config_1 = require("../config/s3-config");
const message_entity_1 = require("./entities/message.entity");
const room_entity_1 = require("./entities/room.entity");
let ChatService = class ChatService {
    constructor(roomRepository, messageRepository, agentRepository, s3ConfigService, natsClient) {
        this.roomRepository = roomRepository;
        this.messageRepository = messageRepository;
        this.agentRepository = agentRepository;
        this.s3ConfigService = s3ConfigService;
        this.natsClient = natsClient;
    }
    async uploadFile(file, roomId) {
        console.log(`📢 Uploading file for room ${roomId}`);
        const fileKey = `${roomId}/${(0, uuid_1.v4)()}_${file.originalname}`;
        const params = {
            Bucket: this.s3ConfigService.getBucketName(),
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        };
        try {
            await this.s3ConfigService.s3.upload(params).promise();
            const fileUrl = `${process.env.S3_URL}/${this.s3ConfigService.getBucketName()}/${fileKey}`;
            console.log(`✅ File uploaded: ${fileUrl}`);
            console.log(`📢 Sending NATS event: file.uploaded → Room ${roomId}`);
            this.natsClient.emit('file.uploaded', { roomId, fileUrl });
            return { fileUrl, fileKey };
        }
        catch (error) {
            console.error(`❌ File upload failed: ${error.message}`);
            throw new Error(`File upload failed: ${error.message}`);
        }
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
            select: ['id', 'userId', 'name'],
        });
        return {
            queueSize: waitingRooms.length,
            waitingRooms: waitingRooms.map((room) => ({
                roomId: room.id,
                userId: room.userId ?? 'Unknown',
                roomName: room.name,
            })),
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
    async leaveUserChat(userId) {
        const chatRoom = await this.roomRepository.findOne({
            where: { userId },
        });
        if (!chatRoom) {
            return { message: `User ${userId} not found in any chat.` };
        }
        if (chatRoom.agentId) {
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
        await this.roomRepository.delete(chatRoom.id);
        console.log(`[LEAVE CHAT] User ${userId} has left. Room ${chatRoom.id} deleted.`);
        return { message: `User ${userId} successfully removed from chat.` };
    }
    async leaveAgentChat(agentId) {
        console.log(`[LEAVE CHAT] Agent ${agentId} is leaving the chat.`);
        const agent = await this.agentRepository.findOne({
            where: { agentId },
        });
        if (!agent) {
            return { message: `Agent ${agentId} not found.` };
        }
        await this.agentRepository.update(agent.id, { status: 'ready' });
        console.log(`Agent ${agentId} is now ready.`);
        const waitingRooms = await this.roomRepository.find({
            where: { agentId: (0, typeorm_2.IsNull)() },
        });
        if (waitingRooms.length > 0) {
            const waitingRoom = waitingRooms[0];
            await this.roomRepository.update(waitingRoom.id, {
                agentId: agent.agentId,
            });
            await this.agentRepository.update(agent.id, { status: 'busy' });
            console.log(`Assigned Agent ${agentId} to Room ${waitingRoom.id}.`);
            const userId = waitingRoom.userId;
            return {
                message: `Agent ${agentId} is now ready and assigned to Room ${waitingRoom.id}.`,
                roomId: waitingRoom.id,
                userId: userId,
            };
        }
        else {
            console.log(`No users in queue for Agent ${agentId}.`);
        }
        return {
            message: `Agent ${agentId} is now ready and no users are in the queue.`,
        };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(room_entity_1.Room)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(2, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __param(4, (0, common_1.Inject)('NATS_SERVICE')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        s3_config_1.S3ConfigService,
        microservices_1.ClientProxy])
], ChatService);
//# sourceMappingURL=chat.service.js.map