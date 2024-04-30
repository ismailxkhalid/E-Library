import { NextFunction, Request, Response } from 'express';
import { Book } from '../models/bookModel';
import createHttpError from 'http-errors';

// GET ALL BOOKS
const allBooks = async (req: Request, res: Response) => {
    try {
        const books = await Book.find({});
        res.send(books);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// CREATE BOOK
const createBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json({ message: 'Book Created' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export { allBooks, createBook };
