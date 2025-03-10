import { ChatService } from './chat.service';
import { LeaveAgentChatDto, LeaveChatDto } from './dto/leave-chat.dto';
import { UploadFileDto } from './dto/upload-file.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    leaveQueue(leaveChatDto: LeaveChatDto): Promise<{
        message: string;
    }>;
    leaveUserChat(leaveChatDto: LeaveChatDto): Promise<{
        message: string;
    }>;
    leaveChat(leaveAgentChatDto: LeaveAgentChatDto): Promise<{
        message: string;
        roomId?: number;
        userId?: string;
    }>;
    uploadFile(file: Express.Multer.File, uploadFileDto: UploadFileDto): Promise<{
        fileUrl: string;
        fileKey: string;
    } | {
        message: string;
    }>;
}
