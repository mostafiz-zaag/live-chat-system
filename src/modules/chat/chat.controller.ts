import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

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
}
