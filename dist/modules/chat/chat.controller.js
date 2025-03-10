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
exports.ChatController = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const platform_express_1 = require("@nestjs/platform-express");
const multerS3 = require("multer-s3");
const s3_config_1 = require("../config/s3.config");
const chat_service_1 = require("./chat.service");
const s3 = new client_s3_1.S3Client({
    region: s3_config_1.S3_CONFIG.REGION,
    credentials: {
        accessKeyId: s3_config_1.S3_CONFIG.S3_ACCESS_KEY,
        secretAccessKey: s3_config_1.S3_CONFIG.S3_SECRET_KEY,
    },
});
let ChatController = class ChatController {
    constructor(chatService, eventEmitter) {
        this.chatService = chatService;
        this.eventEmitter = eventEmitter;
    }
    async uploadFile(file, roomId) {
        if (!file) {
            return { message: 'File upload failed' };
        }
        const fileUrl = `${s3_config_1.S3_CONFIG.S3_URL}/${s3_config_1.S3_CONFIG.S3_BUCKET_NAME}/${file.key}`;
        console.log(`✅ File uploaded: ${fileUrl}`);
        this.eventEmitter.emit('file.uploaded', { roomId, fileUrl });
        await this.chatService.saveMessage(Number(roomId), 'system', fileUrl);
        return {
            message: 'File uploaded successfully',
            fileUrl: fileUrl,
        };
    }
    async leaveQueue(userId) {
        console.log(`[LEAVE QUEUE] User ${userId} requested to leave the queue.`);
        const chatRoom = await this.chatService.getWaitingRoomByUser(userId);
        if (!chatRoom) {
            return { message: `User ${userId} is not in the queue.` };
        }
        if (chatRoom.agentId) {
            chatRoom.userId = null;
            await this.chatService.updateRoom(chatRoom);
            return {
                message: `User ${userId} has left the chat room and is no longer in the queue.`,
            };
        }
        await this.chatService.deleteRoom(chatRoom.id);
        console.log(`[LEAVE QUEUE] User ${userId} removed from the queue. Room ${chatRoom.id} deleted.`);
        return {
            message: `User ${userId} successfully removed from the queue.`,
        };
    }
    async leaveUserChat(userId) {
        console.log(`[LEAVE USER CHAT] User ${userId} requested to leave chat.`);
        return await this.chatService.leaveUserChat(userId);
    }
    async leaveChat(agentId) {
        console.log(`[LEAVE CHAT] Agent ${agentId} is leaving the chat.`);
        return await this.chatService.leaveAgentChat(agentId);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: multerS3({
            s3: s3,
            bucket: s3_config_1.S3_CONFIG.S3_BUCKET_NAME || 'default-bucket-name',
            acl: 'public-read',
            contentType: (req, file, cb) => {
                cb(null, file.mimetype);
            },
            key: (req, file, cb) => {
                const fileName = `${s3_config_1.S3_CONFIG.S3_PREFIX}/${Date.now()}_${file.originalname}`;
                cb(null, fileName);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('leave-queue'),
    __param(0, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "leaveQueue", null);
__decorate([
    (0, common_1.Post)('leave-user-chat'),
    __param(0, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "leaveUserChat", null);
__decorate([
    (0, common_1.Post)('leave-agent-chat'),
    __param(0, (0, common_1.Body)('agentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "leaveChat", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        event_emitter_1.EventEmitter2])
], ChatController);
//# sourceMappingURL=chat.controller.js.map