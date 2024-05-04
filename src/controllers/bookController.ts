import { NextFunction, Request, Response } from 'express';
import path from 'node:path';
import { Book } from '../models/bookModel';
import createHttpError from 'http-errors';
import cloudinary from '../config/cloudinary';

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
    const files = req.files as { [filename: string]: Express.Multer.File[] };

    // Upload Cover Image
    try {
        const coverImageMimeType = files.coverImage[0].mimetype
            .split('/')
            .at(-1);
        const bookCoverFileName = files.coverImage[0].filename;
        const bookCoverFilePath = path.resolve(
            __dirname,
            `../../public/data/uploads/`,
            bookCoverFileName
        );
        const bookCoverUploadResult = await cloudinary.uploader.upload(
            bookCoverFilePath,
            {
                filename_override: bookCoverFileName,
                folder: 'book-covers',
                format: coverImageMimeType
            }
        );

        console.log('Book Cover Upload Result: ', bookCoverUploadResult);
    } catch (error: any) {
        console.log(error);
        return next(createHttpError(500, 'Error while uploading book cover'));
    }

    // Upload Book Pdf
    try {
        const bookPdfFileName = files.file[0].filename;
        const bookPdfFilePath = path.resolve(
            __dirname,
            '../../public/data/uploads/',
            bookPdfFileName
        );

        const bookPdfUploadResult = await cloudinary.uploader.upload(
            bookPdfFilePath,
            {
                resource_type: 'raw',
                filename_override: bookPdfFileName,
                folder: 'book-pdfs',
                format: 'pdf'
            }
        );

        console.log('Book Pdf Upload Result: ', bookPdfUploadResult);
    } catch (error) {
        console.log(error);
        return next(createHttpError(500, 'Error while uploading book pdf'));
    }

    res.json({ message: 'Book created successfully ✅' });
};

export { allBooks, createBook };
