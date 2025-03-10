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
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    constructor(chatService, natsClient) {
        this.chatService = chatService;
        this.natsClient = natsClient;
        this.activeUsers = new Map();
    }
    async onModuleInit() {
        console.log(`🚀 ChatGateway initialized. Subscribing to NATS events...`);
        await this.natsClient.connect();
        this.natsClient.send('file.uploaded', {}).subscribe({
            next: (payload) => {
                console.log(`📢 Received NATS event: file.uploaded`, payload);
                this.handleFileUploaded(payload);
            },
            error: (err) => console.error(`❌ Error receiving NATS event: ${err.message}`),
        });
    }
    handleConnection(client) {
        console.log(`✅ Client connected: ${client.id}`);
        if (!this.server) {
            this.server = client.nsp.server;
            console.log(`🚀 WebSocket server initialized.`);
        }
    }
    handleDisconnect(client) {
        console.log(`❌ Client disconnected: ${client.id}`);
        this.activeUsers.delete(client.id);
    }
    async handleJoinRoom(client, data) {
        console.log(`🔵 Received joinRoom event:`, data);
        try {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            if (!data.roomId || !data.userId) {
                client.emit('error', {
                    message: 'roomId and userId are required.',
                });
                return;
            }
            const roomIdNum = parseInt(data.roomId, 10);
            if (isNaN(roomIdNum)) {
                client.emit('error', { message: 'Invalid room ID format.' });
                return;
            }
            const room = await this.chatService.getRoomById(roomIdNum);
            if (!room) {
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
        catch (error) {
            console.error(`❌ Error in joinRoom: ${error.message}`);
            client.emit('error', { message: 'Server error in joinRoom.' });
        }
    }
    async handleMessage(client, data) {
        console.log('🔵 Received sendMessage event:', data);
        try {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            const { roomId, sender, message } = data;
            if (!roomId || !sender || !message) {
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
        catch (error) {
            console.error(`❌ Error in handleMessage: ${error.message}`);
            client.emit('error', { message: 'Server error in sendMessage.' });
        }
    }
    handleFileUploaded(payload) {
        console.log(`📢 NATS Event Received: file.uploaded for room ${payload.roomId}`);
        if (!this.server) {
            console.error(`❌ WebSocket server is not initialized.`);
            return;
        }
        console.log(`📢 Broadcasting file to WebSocket room ${payload.roomId}`);
        this.server.to(payload.roomId).emit('newMessage', {
            sender: 'system',
            message: `📎 File uploaded: ${payload.fileUrl}`,
            fileUrl: payload.fileUrl,
        });
        console.log(`✅ WebSocket event sent to room ${payload.roomId}`);
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
    (0, microservices_1.EventPattern)('file.uploaded'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleFileUploaded", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } }),
    __param(1, (0, common_1.Inject)('NATS_SERVICE')),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        microservices_1.ClientProxy])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map