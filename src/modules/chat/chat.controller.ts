import {
    Body,
    Controller,
    Inject,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) {}

    // User requests to leave the queue
    @Post('leave-queue')
    async leaveQueue(@Body('userId') userId: string) {
        console.log(
            `[LEAVE QUEUE] User ${userId} requested to leave the queue.`,
        );

        // Check if the user is in the queue (waiting for an agent)
        const chatRoom = await this.chatService.getWaitingRoomByUser(userId);
        if (!chatRoom) {
            return { message: `User ${userId} is not in the queue.` };
        }

        // If the user has been assigned to an agent, update the room accordingly
        if (chatRoom.agentId) {
            // Remove the user from the room (keeping it open for the agent to finish the chat)
            chatRoom.userId = null;
            await this.chatService.updateRoom(chatRoom);

            return {
                message: `User ${userId} has left the chat room and is no longer in the queue.`,
            };
        }

        // If no agent is assigned, remove the user from the queue (delete the room)
        await this.chatService.deleteRoom(chatRoom.id);
        console.log(
            `[LEAVE QUEUE] User ${userId} removed from the queue. Room ${chatRoom.id} deleted.`,
        );

        return {
            message: `User ${userId} successfully removed from the queue.`,
        };
    }

    // Endpoint for user to leave the chat or queue
    @Post('leave-user-chat')
    async leaveUserChat(@Body('userId') userId: string) {
        console.log(
            `[LEAVE USER CHAT] User ${userId} requested to leave chat.`,
        );

        return await this.chatService.leaveUserChat(userId);
    }

    @Post('leave-agent-chat')
    async leaveChat(@Body('agentId') agentId: string) {
        console.log(`[LEAVE CHAT] Agent ${agentId} is leaving the chat.`);

        return await this.chatService.leaveAgentChat(agentId);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('roomId') roomId: string,
    ) {
        if (!file) {
            return { message: 'File upload failed' };
        }

        // ✅ Upload file and get the file URL
        const { fileUrl } = await this.chatService.uploadFile(file, roomId);

        return { message: 'File uploaded successfully', fileUrl };
    }
}
