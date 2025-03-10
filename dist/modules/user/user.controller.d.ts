import { UserService } from './user.service';
export declare class UserController {
    private readonly usersService;
    constructor(usersService: UserService);
    requestAssistance(userId: string): Promise<{
        message: string;
        room: import("../chat/entities/room.entity").Room;
    }>;
    getQueueSize(): Promise<{
        queueSize: number;
        waitingRooms: {
            roomId: number;
            userId: string;
            roomName: string;
        }[];
    }>;
}
