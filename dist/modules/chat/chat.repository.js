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
exports.ChatRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./entities/message.entity");
const room_entity_1 = require("./entities/room.entity");
let ChatRepository = class ChatRepository {
    constructor(roomRepository, messageRepository) {
        this.roomRepository = roomRepository;
        this.messageRepository = messageRepository;
    }
    async createRoom(name) {
        const room = this.roomRepository.create({ name });
        return this.roomRepository.save(room);
    }
    async updateRoomAgent(roomId, agentId) {
        await this.roomRepository.update({ id: roomId }, { agentId });
    }
    async createMessage(roomId, sender, content) {
        const room = await this.roomRepository.findOne({
            where: { id: roomId },
        });
        if (!room) {
            throw new Error('Room not found');
        }
        const message = this.messageRepository.create({
            content,
            sender,
            room,
            timestamp: new Date(),
        });
        return this.messageRepository.save(message);
    }
    async getMessagesByRoomId(roomId) {
        return this.messageRepository.find({
            where: { room: { id: roomId } },
            order: { timestamp: 'ASC' },
        });
    }
};
exports.ChatRepository = ChatRepository;
exports.ChatRepository = ChatRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(room_entity_1.Room)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChatRepository);
//# sourceMappingURL=chat.repository.js.map