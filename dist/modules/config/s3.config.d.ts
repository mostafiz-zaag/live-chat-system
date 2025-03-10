import * as AWS from 'aws-sdk';
export declare class S3ConfigService {
    s3: AWS.S3;
    constructor();
    getS3Instance(): AWS.S3;
    getBucketName(): string;
}
