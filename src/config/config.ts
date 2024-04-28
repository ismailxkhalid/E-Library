import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const _cofig = {
    port: process.env.PORT
};

export const config = Object.freeze(_cofig);
