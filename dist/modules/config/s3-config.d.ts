import * as AWS from 'aws-sdk';
export declare class S3ConfigService {
    s3: AWS.S3;
    constructor();
    getBucketName(): string;
}
