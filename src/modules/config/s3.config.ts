export const S3_CONFIG = {
    S3_PREFIX: process.env.S3_PREFIX,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || '', // Load from .env
    S3_SECRET_KEY: process.env.S3_SECRET_KEY || '', // Load from .env
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_URL: process.env.S3_URL,
    REGION: process.env.REGION,
};
