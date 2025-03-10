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
exports.ChatGateway = void 0;
const event_emitter_1 = require("@nestjs/event-emitter");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    constructor(chatService, eventEmitter) {
        this.chatService = chatService;
        this.eventEmitter = eventEmitter;
        this.activeUsers = new Map();
    }
    afterInit() {
        console.log('✅ WebSocket initialized');
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        this.activeUsers.delete(client.id);
    }
    async handleJoinRoom(client, data) {
        console.log(`🔵 Received joinRoom event (RAW):`, data);
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            }
            catch (error) {
                console.error(`❌ Error: Invalid JSON format.`, data);
                client.emit('error', { message: 'Invalid JSON format.' });
                return;
            }
        }
        if (!data.roomId || !data.userId) {
            console.error(`❌ Error: roomId and userId are required.`);
            client.emit('error', {
                message: 'roomId and userId are required.',
            });
            return;
        }
        const roomIdNum = parseInt(data.roomId, 10);
        if (isNaN(roomIdNum)) {
            console.error(`❌ Error: Invalid room ID format.`);
            client.emit('error', { message: 'Invalid room ID format.' });
            return;
        }
        const room = await this.chatService.getRoomById(roomIdNum);
        if (!room) {
            console.error(`❌ Error: Room ${roomIdNum} does not exist.`);
            client.emit('error', {
                message: `Room ${roomIdNum} does not exist.`,
            });
            return;
        }
        client.join(roomIdNum.toString());
        console.log(`📌 ${data.userId} joined room ${roomIdNum}`);
        client.emit('joinedRoom', {
            roomId: roomIdNum,
            message: `You joined room ${roomIdNum}`,
        });
    }
    async handleMessage(client, data) {
        console.log('🔵 Received sendMessage event (RAW):', data);
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            }
            catch (error) {
                console.error('❌ Error: Invalid JSON format.');
                client.emit('error', { message: 'Invalid JSON format.' });
                return;
            }
        }
        const { roomId, sender, message } = data;
        if (!roomId || !sender || !message) {
            console.error('❌ Error: roomId, sender, and message are required.');
            client.emit('error', {
                message: 'roomId, sender, and message are required.',
            });
            return;
        }
        const roomIdStr = String(roomId);
        console.log(`📩 ${sender} sent message in room ${roomIdStr}: "${message}"`);
        await this.chatService.saveMessage(Number(roomIdStr), sender, message);
        this.server.to(roomIdStr).emit('newMessage', { sender, message });
    }
    async handleGetChatHistory(client, data) {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            }
            catch (error) {
                console.error('❌ Error: Invalid JSON format.');
                client.emit('error', { message: 'Invalid JSON format.' });
                return;
            }
        }
        const { roomId } = data;
        if (!roomId) {
            client.emit('error', { message: 'roomId is required.' });
            return;
        }
        const messages = await this.chatService.getChatHistory(roomId);
        client.emit('chatHistory', messages);
        console.log(`📜 Sent chat history for room ${roomId}`);
    }
    handleFileUploaded(payload) {
        console.log(`📢 Broadcasting file to room ${payload.roomId}: ${payload.fileUrl}`);
        if (this.server) {
            this.server.to(payload.roomId).emit('newMessage', {
                sender: 'system',
                message: `📎 File uploaded: ${payload.fileUrl}`,
                fileUrl: payload.fileUrl,
            });
        }
        else {
            console.error(`❌ WebSocket server is not initialized.`);
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getChatHistory'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetChatHistory", null);
__decorate([
    (0, event_emitter_1.OnEvent)('file.uploaded'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleFileUploaded", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        event_emitter_1.EventEmitter2])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map