import mongoose from 'mongoose';
import { DB_NAME } from '../constants';
import { config } from './config';

export const connectDB = async () => {
    try {
        await mongoose.connect(`${config.db_url}/${DB_NAME}`);
        mongoose.connection.on('connected', () => {
            console.log('MONGODB CONNECTED 🟢');
        });
        console.log('MONGODB CONNECTED 🟢');
        mongoose.connection.on('error', (error) => {
            console.log('MONGODB CONNECTION FAILED 🔴');
        });
    } catch (error) {
        console.error('MONGODB CONNECTION FAILED 🔴', error);
        process.exit(1);
    }
};
