import mongoose from 'mongoose';
import { UserTypes } from '../types/userTypes';

const userSchema = new mongoose.Schema<UserTypes>(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String
        }
    },
    { timestamps: true }
);

export const User = mongoose.model<UserTypes>('User', userSchema);
