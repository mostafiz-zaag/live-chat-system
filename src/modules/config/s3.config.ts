export const S3_CONFIG = {
    S3_PREFIX: process.env.S3_PREFIX || 'live-chat-system',
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || '',
    S3_SECRET_KEY: process.env.S3_SECRET_KEY || '',
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'zaag-test',
    S3_URL: process.env.S3_URL || 'https://sgp1.digitaloceanspaces.com',
    REGION: process.env.S3_REGION || 'sgp1', // ✅ Fix: Use S3_REGION instead
};
