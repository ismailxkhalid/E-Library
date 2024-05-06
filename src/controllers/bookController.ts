import { NextFunction, Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { Book } from '../models/bookModel';
import createHttpError from 'http-errors';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middleware/authenticate';

// GET ALL BOOKS
const allBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // RETRIEVE ALL BOOKS FROM DATABASE
        const books = await Book.find().populate('author', 'name');
        res.json(books); // SEND BOOKS AS RESPONSE
    } catch (error: any) {
        return next(createHttpError(500, error.message));
    }
};

// GET SINGLE BOOK
const getSinleBook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const bookId = req.params.bookId;

    try {
        const book = await Book.findOne({ _id: bookId }).populate(
            'author',
            'name'
        );
        if (!book) {
            return next(createHttpError(404, 'Book not found'));
        }
        return res.json(book);
    } catch (error: any) {
        return next(createHttpError(500, error.message));
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
        // FORWARD ERROR TO ERROR-HANDLING MIDDLEWARE
        return next(createHttpError(500, error));
    }
};

// DELETE BOOK
const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId;
    try {
        const book = await Book.findOne({ _id: bookId });
        if (!book) {
            return next(createHttpError(404, 'Book not found'));
        }
        // CHECK IF THE USER HAS ACCESS TO DELETE THE BOOK
        const _req = req as AuthRequest;
        if (book.author.toString() !== _req.userId) {
            return next(
                createHttpError(403, 'You can not delete others book.')
            );
        }

        // DELETE BOOK FROM CLOUDINARY
        const coverFileSplits = book.coverImage.split('/'); // get cover image public id and delete it on cloudinary
        const coverImagePublicId =
            coverFileSplits.at(-2) +
            '/' +
            coverFileSplits.at(-1)?.split('.').at(-2);

        const pdfFileSplits = book.file.split('/'); // get pdf file public id and delete it on cloudinary
        const pdfFilePublicId =
            pdfFileSplits.at(-2) + '/' + pdfFileSplits.at(-1);

        await cloudinary.uploader.destroy(coverImagePublicId);
        await cloudinary.uploader.destroy(pdfFilePublicId, {
            resource_type: 'raw'
        });
        await Book.deleteOne({ _id: bookId });
        return res
            .status(204)
            .json({ message: 'Book deleted successfully ✅' });
    } catch (error: any) {
        return next(createHttpError(500, error.message));
    }
};

// UPDATE BOOK
const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, genre } = req.body;
    const bookId = req.params.bookId;
    // CHECK IF BOOK EXISTS
    const book = await Book.findOne({ _id: bookId });

    // IF BOOK IS NOT FOUND, RETURN 404 ERROR
    if (!book) {
        return next(createHttpError(404, 'Book not found'));
    }

    // CHECK IF THE USER HAS ACCESS TO UPDATE THE BOOK
    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, 'You can not update others book.'));
    }

    // CHECK IF THE COVER IMAGE FILE EXISTS IN THE REQUEST
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let completeCoverImage = '';
    if (files.coverImage) {
        const bookCoverFileName = files.coverImage[0].filename;
        const converMimeType = files.coverImage[0].mimetype.split('/').at(-1);
        const bookCoverFilePath = path.resolve(
            __dirname,
            '../../public/data/uploads/' + bookCoverFileName
        );
        completeCoverImage = bookCoverFileName;

        // UPLOAD COVER IMAGE TO CLOUDINARY
        const uploadResult = await cloudinary.uploader.upload(
            bookCoverFilePath,
            {
                filename_override: completeCoverImage,
                folder: 'book-covers',
                format: converMimeType
            }
        );

        completeCoverImage = uploadResult.secure_url;

        // DELETE OLD BOOK COVER FROM CLOUDINARY
        const coverFileSplits = book.coverImage.split('/'); // get cover image public id and delete it on cloudinary
        const coverImagePublicId =
            coverFileSplits.at(-2) +
            '/' +
            coverFileSplits.at(-1)?.split('.').at(-2);
        await cloudinary.uploader.destroy(coverImagePublicId);

        // DELETE TEMPORARY FILES FROM SERVER
        await fs.promises.unlink(bookCoverFilePath);
    }

    // CHECK IF THE PDF FILE FIELD EXISTS IN THE REQUEST
    let completeFileName = '';
    if (files.file) {
        const bookPdfFilePath = path.resolve(
            __dirname,
            '../../public/data/uploads/' + files.file[0].filename
        );

        const bookPdfFileName = files.file[0].filename;
        completeFileName = bookPdfFileName;

        // UPLOAD BOOK FILE TO CLOUDINARY
        const uploadResultPdf = await cloudinary.uploader.upload(
            bookPdfFilePath,
            {
                resource_type: 'raw',
                filename_override: completeFileName,
                folder: 'book-pdfs',
                format: 'pdf'
            }
        );

        completeFileName = uploadResultPdf.secure_url;

        // DELETE OLD BOOK PDF FROM CLOUDINARY
        const pdfFileSplits = book.file.split('/'); // get pdf file public id and delete it on cloudinary
        const pdfFilePublicId =
            pdfFileSplits.at(-2) + '/' + pdfFileSplits.at(-1);
        await cloudinary.uploader.destroy(pdfFilePublicId, {
            resource_type: 'raw'
        });

        // DELETE TEMPORARY FILES FROM SERVER
        await fs.promises.unlink(bookPdfFilePath);
    }

    // UPDATE BOOK DETAILS IN THE DATABASE
    const updatedBook = await Book.findOneAndUpdate(
        {
            _id: bookId
        },
        {
            title: title,
            description: description,
            genre: genre,

            coverImage: completeCoverImage
                ? completeCoverImage
                : book.coverImage,
            file: completeFileName ? completeFileName : book.file
        },
        { new: true }
    );

    // RETURN THE UPDATED BOOK AS JSON RESPONSE
    res.json(updatedBook);
};

export { allBooks, createBook, updateBook, getSinleBook, deleteBook };
