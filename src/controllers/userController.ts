// controllers/userController.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { User } from '../models/userModel';
import { config } from '../config/config';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

const createToken = (_id: string) => {
    return jwt.sign({ sub: _id }, config.secret as string, {
        expiresIn: '7d',
        algorithm: 'HS256'
    });
};

// GET ALL USERS
export const allUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Login Controller
export const userLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = req.body;
    console.log(req.body);

    try {
        // Credentials Validation
        if (!email || !password) {
            const error = createHttpError(
                400,
                'Please provide email and password'
            );
            return next(error);
        }

        const user = await User.findOne({ email });
        if (!user) {
            const error = createHttpError(401, 'Incorrect email');
            return next(error);
        }

        // Ensure user.password is not null or undefined before comparing
        if (!user.password) {
            const error = createHttpError(401, 'User Password is not set');
            return next(error);
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            const error = createHttpError(401, 'Incorrect password');
            return next(error);
        }

        //Creating and Assigning Token
        const token = createToken(user._id.toString());

        res.status(200).json({ email, token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Signup Controller
export const userSignup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name, email, password } = req.body;
    console.log(req.body);

    try {
        // Credentials Validation
        if (!name || !email || !password) {
            const error = createHttpError(
                400,
                'All fields (Name, Email and Password) are required!'
            );
            return next(error);
        }
        if (!validator.isEmail(email)) {
            const error = createHttpError(400, 'Invalid email format !');
            return next(error);
        }
        if (!validator.isStrongPassword(password)) {
            const error = createHttpError(
                400,
                'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character !'
            );
            return next(error);
        }

        const exists = await User.findOne({ email });

        if (exists) {
            const error = createHttpError(400, 'Email already exists !');
            return next(error);
        }

        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: hash });

        //Creating and Assigning Token
        const token = createToken(user._id.toString());

        res.status(201).json({ email, token });
    } catch (error: any) {
        error = createHttpError(500, error.message);
        return next(error);
    }
};
