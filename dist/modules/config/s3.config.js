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
exports.S3ConfigService = void 0;
const common_1 = require("@nestjs/common");
const AWS = require("aws-sdk");
let S3ConfigService = class S3ConfigService {
    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY,
            region: process.env.S3_REGION,
            endpoint: process.env.S3_URL,
            s3ForcePathStyle: true,
            signatureVersion: 'v4',
        });
    }
    getS3Instance() {
        return this.s3;
    }
    getBucketName() {
        return process.env.S3_BUCKET_NAME || '';
    }
};
exports.S3ConfigService = S3ConfigService;
exports.S3ConfigService = S3ConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], S3ConfigService);
//# sourceMappingURL=s3.config.js.map