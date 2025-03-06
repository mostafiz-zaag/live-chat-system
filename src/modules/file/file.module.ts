// src/modules/file/file.module.ts
import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { S3ConfigService } from '../config/s3.config';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
    imports: [ChatModule],
    controllers: [FileController],
    providers: [FileService, S3ConfigService],
})
export class FileModule {}
