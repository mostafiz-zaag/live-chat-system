import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3ConfigService {
    public s3: AWS.S3;

    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY,
            region: process.env.S3_REGION,
            endpoint: process.env.S3_URL, // DigitalOcean Spaces or S3 Endpoint
            s3ForcePathStyle: true, // ✅ Required for DigitalOcean Spaces
            signatureVersion: 'v4',
        });
    }

    getBucketName(): string {
        return process.env.S3_BUCKET_NAME || '';
    }
}
