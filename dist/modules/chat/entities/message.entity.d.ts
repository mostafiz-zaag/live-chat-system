import { Room } from './room.entity';
export declare class Message {
    id: number;
    content: string;
    sender: string;
    timestamp: Date;
    room: Room;
}
