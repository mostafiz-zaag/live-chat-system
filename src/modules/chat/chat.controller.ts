import { S3Client } from '@aws-sdk/client-s3';
import {
    Body,
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multerS3 from 'multer-s3';
import { S3_CONFIG } from '../config/s3.config';
import { ChatService } from './chat.service';

interface S3File extends Express.Multer.File {
    key: string;
}

const s3 = new S3Client({
    region: S3_CONFIG.REGION,
    credentials: {
        accessKeyId: S3_CONFIG.S3_ACCESS_KEY,
        secretAccessKey: S3_CONFIG.S3_SECRET_KEY,
    },
});
@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private eventEmitter: EventEmitter2,
    ) {}

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: multerS3({
                s3: s3,
                bucket: S3_CONFIG.S3_BUCKET_NAME || 'default-bucket-name',
                acl: 'public-read',
                contentType: (req, file, cb) => {
                    cb(null, file.mimetype); // ✅ Use the file's original MIME type
                },
                key: (req, file, cb) => {
                    const fileName = `${S3_CONFIG.S3_PREFIX}/${Date.now()}_${file.originalname}`;
                    cb(null, fileName);
                },
            }),
        }),
    )
    async uploadFile(
        @UploadedFile() file: S3File,
        @Body('roomId') roomId: string,
    ) {
        if (!file) {
            return { message: 'File upload failed' };
        }

        const fileUrl = `${S3_CONFIG.S3_URL}/${S3_CONFIG.S3_BUCKET_NAME}/${file.key}`;
        console.log(`✅ File uploaded: ${fileUrl}`);

        // Emit event to send file URL to the room
        this.eventEmitter.emit('file.uploaded', { roomId, fileUrl });

        // Save the file message in chat history
        await this.chatService.saveMessage(Number(roomId), 'system', fileUrl);

        return {
            message: 'File uploaded successfully',
            fileUrl: fileUrl,
        };
    }

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
}
