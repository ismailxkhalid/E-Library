import express from 'express';
import { allUsers, userLogin, userSignup } from '../controllers/userController';
const router = express.Router();

//Get All users
router.get('/', allUsers);
//Login Route
router.post('/login', userLogin);
//SignUp Route
router.post('/signup', userSignup);

export { router as userRouter };
