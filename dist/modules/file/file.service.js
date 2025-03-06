"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const chat_gateway_1 = require("../chat/chat.gateway");
const s3_config_1 = require("../config/s3.config");
let FileService = class FileService {
    constructor(s3Config, chatGateway) {
        this.s3Config = s3Config;
        this.chatGateway = chatGateway;
    }
    async uploadFile(file, uploadFileDto) {
        const fileKey = `${uploadFileDto.roomId}/${(0, uuid_1.v4)()}-${file.originalname}`;
        console.log('uploadFileDto--------------- ', uploadFileDto);
        const params = {
            Bucket: this.s3Config.getBucketName(),
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        };
        try {
            await this.s3Config.s3.upload(params).promise();
            const fileUrl = `${process.env.S3_URL}/${this.s3Config.getBucketName()}/${fileKey}`;
            this.chatGateway.broadcastFileToRoom(uploadFileDto.roomId, fileUrl, fileKey);
            return { fileUrl, fileKey };
        }
        catch (error) {
            if (error.code === 'NoSuchBucket') {
                throw new Error('The specified S3 bucket does not exist.');
            }
            else if (error.code === 'AccessDenied') {
                throw new Error('Access denied to the S3 bucket. Please check your permissions.');
            }
            else if (error.code === 'NetworkingError') {
                throw new Error('Network error while uploading the file. Please try again later.');
            }
            else {
                throw new Error(`File upload failed: ${error.message}`);
            }
        }
    }
};
exports.FileService = FileService;
exports.FileService = FileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [s3_config_1.S3ConfigService,
        chat_gateway_1.ChatGateway])
], FileService);
//# sourceMappingURL=file.service.js.map