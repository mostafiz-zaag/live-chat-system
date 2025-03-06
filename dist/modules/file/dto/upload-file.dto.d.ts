export declare enum SenderType {
    USER = "user",
    AGENT = "agent"
}
export declare class UploadFileDto {
    roomId: string;
    senderType: SenderType;
}
