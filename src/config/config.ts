import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const _cofig = {
    port: process.env.PORT,
    db_url: process.env.MONGODB_URL,
    env: process.env.NODE_ENV,
    secret: process.env.JWT_SECRET,
    cloudnary_cloud: '123'
};

export const config = Object.freeze(_cofig);
