import { UploadFileDto } from './dto/upload-file.dto';
import { FileService } from './file.service';
export declare class FileController {
    private readonly fileService;
    constructor(fileService: FileService);
    uploadFile(file: Express.Multer.File, uploadFileDto: UploadFileDto): Promise<{
        fileUrl: string;
        fileKey: string;
    }>;
}
