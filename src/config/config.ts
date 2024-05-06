import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const _cofig = {
    port: process.env.PORT,
    db_url: process.env.MONGODB_URL,
    env: process.env.NODE_ENV,
    secret: process.env.JWT_SECRET,
    cloudnary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudnary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudnary_api_secret: process.env.CLOUDINARY_API_SECRET,
    frontendDomain: process.env.FRONTEND_DOMAIN
};

export const config = Object.freeze(_cofig);
