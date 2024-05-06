import mongoose from 'mongoose';
import { BookTypes } from '../types/bookTypes';

const bookSchema = new mongoose.Schema<BookTypes>(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        genre: {
            type: String,
            required: true
        },
        coverImage: {
            type: String,
            required: true
        },
        file: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export const Book = mongoose.model<BookTypes>('Book', bookSchema);
