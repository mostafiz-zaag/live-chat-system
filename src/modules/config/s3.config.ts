import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3ConfigService {
    public s3: AWS.S3;

    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.S3_ACCESS_KEY, // Your Access Key ID
            secretAccessKey: process.env.S3_SECRET_KEY, // Your Secret Access Key
            region: process.env.REGION, // Your region
            endpoint: process.env.S3_URL, // DigitalOcean endpoint URL
            s3ForcePathStyle: true, // Required for DigitalOcean Spaces
            signatureVersion: 'v4',
        });
    }

    getS3Instance(): AWS.S3 {
        return this.s3;
    }

    getBucketName(): string {
        return process.env.S3_BUCKET_NAME || ''; // Ensures bucket name is fetched from the environment
    }
}
