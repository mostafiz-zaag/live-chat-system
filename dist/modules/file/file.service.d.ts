import { ChatGateway } from '../chat/chat.gateway';
import { S3ConfigService } from '../config/s3.config';
import { UploadFileDto } from './dto/upload-file.dto';
export declare class FileService {
    private readonly s3Config;
    private readonly chatGateway;
    constructor(s3Config: S3ConfigService, chatGateway: ChatGateway);
    uploadFile(file: Express.Multer.File, uploadFileDto: UploadFileDto): Promise<{
        fileUrl: string;
        fileKey: string;
    }>;
}
