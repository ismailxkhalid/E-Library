import express from 'express';
import { allBooks, createBook } from '../controllers/bookController';
const router = express.Router();

//Get All users
router.get('/', allBooks);
//Login Route
router.post('/create', createBook);

export { router as bookRouter };
