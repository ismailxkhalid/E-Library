// controllers/userController.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { User } from '../models/userModel';
import { config } from '../config/config';
import { Request, Response } from 'express';

const createToken = (_id: string) => {
    return jwt.sign({ _id }, config.secret as string, { expiresIn: '3d' });
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
export const userLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(req.body);

    try {
        // Credentials Validation
        if (!email || !password) {
            throw new Error('Both fields (Email and Password) are required!');
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Incorrect Email');
        }

        // Ensure user.password is not null or undefined before comparing
        if (!user.password) {
            throw new Error('User password is not set');
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new Error('Incorrect Password');
        }

        //Creating and Assigning Token
        const token = createToken(user._id.toString());

        res.status(200).json({ email, token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Signup Controller
export const userSignup = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    console.log(req.body);

    try {
        // Credentials Validation
        if (!name || !email || !password) {
            console.log(name, email, password);
            throw new Error(
                'All fields (Name, Email and Password) are required!'
            );
        }
        if (!validator.isEmail(email)) {
            throw new Error('Email is not valid!');
        }
        if (!validator.isStrongPassword(password)) {
            throw new Error(
                'Password is not Strong. Use at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character !@#$%&*.'
            );
        }

        const exists = await User.findOne({ email });

        if (exists) {
            throw new Error('Email already in use !');
        }

        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: hash });

        //Creating and Assigning Token
        const token = createToken(user._id.toString());

        res.status(200).json({ email, token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
