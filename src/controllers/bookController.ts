import { NextFunction, Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { Book } from '../models/bookModel';
import createHttpError from 'http-errors';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middleware/authenticate';

// GET ALL BOOKS
const allBooks = async (req: Request, res: Response) => {
    try {
        // RETRIEVE ALL BOOKS FROM DATABASE
        const books = await Book.find({});
        res.send(books); // SEND BOOKS AS RESPONSE
    } catch (error: any) {
        res.status(500).json({ error: error.message }); // HANDLE ERROR IF OCCURS
    }
};

// CREATE BOOK
const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [filename: string]: Express.Multer.File[] };

    const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1);
    const bookCoverFileName = files.coverImage[0].filename;
    const bookCoverFilePath = path.resolve(
        __dirname,
        `../../public/data/uploads/`,
        bookCoverFileName
    );

    // UPLOAD COVER IMAGE TO CLOUDINARY
    try {
        const bookCoverUploadResult = await cloudinary.uploader.upload(
            bookCoverFilePath,
            {
                filename_override: bookCoverFileName,
                folder: 'book-covers',
                format: coverImageMimeType
            }
        );

        const bookPdfFileName = files.file[0].filename;
        const bookPdfFilePath = path.resolve(
            __dirname,
            '../../public/data/uploads/',
            bookPdfFileName
        );

        // UPLOAD BOOK PDF TO CLOUDINARY
        const bookPdfUploadResult = await cloudinary.uploader.upload(
            bookPdfFilePath,
            {
                resource_type: 'raw',
                filename_override: bookPdfFileName,
                folder: 'book-pdfs',
                format: 'pdf'
            }
        );
        const _req = req as AuthRequest;
        // SAVE BOOK DETAILS TO DATABASE
        const newBook = await Book.create({
            title: req.body.title,
            author: _req.userId,
            genre: req.body.genre,
            coverImage: bookCoverUploadResult.secure_url,
            file: bookPdfUploadResult.secure_url
        });

        // SEND SUCCESS RESPONSE
        res.status(201).json({
            message: 'Book created successfully ✅',
            book_id: newBook._id
        });

        // DELETE TEMPORARY FILES
        await fs.promises.unlink(bookCoverFilePath);
        await fs.promises.unlink(bookPdfFilePath);
    } catch (error: any) {
        const errorMessage: string = error.message;
        // FORWARD ERROR TO ERROR-HANDLING MIDDLEWARE
        return next(createHttpError(500, errorMessage));
    }
};

export { allBooks, createBook };
