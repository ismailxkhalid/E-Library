import express from 'express';
import multer from 'multer';
import path, { resolve } from 'node:path';
import { allBooks, createBook } from '../controllers/bookController';
import authenticate from '../middleware/authenticate';
const router = express.Router();

const upload = multer({
    dest: resolve(__dirname, '../../public/data/uploads'),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
//Get All users
router.get('/', allBooks);
//Login Route
router.post(
    '/',
    authenticate,
    upload.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'file', maxCount: 1 }
    ]),
    createBook
);

export { router as bookRouter };
