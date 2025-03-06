import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ChatGateway } from '../chat/chat.gateway';
import { S3ConfigService } from '../config/s3.config';
import { UploadFileDto } from './dto/upload-file.dto'; // Import the UploadFileDto

@Injectable()
export class FileService {
    constructor(
        private readonly s3Config: S3ConfigService,
        private readonly chatGateway: ChatGateway,
    ) {}

    async uploadFile(file: Express.Multer.File, uploadFileDto: UploadFileDto) {
        const fileKey = `${uploadFileDto.roomId}/${uuidv4()}-${file.originalname}`;
        console.log('uploadFileDto--------------- ', uploadFileDto);

        // Set up S3 upload parameters
        const params = {
            Bucket: this.s3Config.getBucketName(),
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read', // Make the file public
        };

        try {
            // Try to upload the file to the S3 bucket
            await this.s3Config.s3.upload(params).promise();

            const fileUrl = `${process.env.S3_URL}/${this.s3Config.getBucketName()}/${fileKey}`;

            this.chatGateway.broadcastFileToRoom(
                uploadFileDto.roomId,
                fileUrl,
                fileKey,
            );

            // Return the file URL and key upon successful upload
            return { fileUrl, fileKey };
        } catch (error) {
            // Catch specific errors and throw a detailed error message
            if (error.code === 'NoSuchBucket') {
                throw new Error('The specified S3 bucket does not exist.');
            } else if (error.code === 'AccessDenied') {
                throw new Error(
                    'Access denied to the S3 bucket. Please check your permissions.',
                );
            } else if (error.code === 'NetworkingError') {
                throw new Error(
                    'Network error while uploading the file. Please try again later.',
                );
            } else {
                // Catch other unexpected errors
                throw new Error(`File upload failed: ${error.message}`);
            }
        }
    }
}
