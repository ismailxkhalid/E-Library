import Jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { config } from '../config/config';
export interface AuthRequest extends Request {
    userId: string;
}

// ASYNCHRONOUS FUNCTION TO HANDLE AUTHENTICATION
const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // RETRIEVE TOKEN FROM REQUEST HEADERS
    const token = req.header('Authorization');
    // CHECK IF TOKEN EXISTS
    if (!token) {
        return next(createHttpError(401, 'Authorization token required'));
    }

    try {
        // PARSE TOKEN FROM BEARER STRING
        const parsedToken = token.split(' ')[1];
        // VERIFY TOKEN USING JWT AND CONFIGURED SECRET
        const decoded = Jwt.verify(parsedToken, config.secret as string);

        // CAST REQUEST TO AUTHENTICATED REQUEST AND ASSIGN USER ID FROM DECODED TOKEN
        const _req = req as AuthRequest;
        _req.userId = decoded.sub as string;
        // CALL NEXT FUNCTION TO PASS CONTROL TO NEXT MIDDLEWARE
        next();
    } catch (error) {
        return next(createHttpError(401, error as string));
    }
};

// EXPORT AUTHENTICATION MIDDLEWARE FUNCTION
export default authenticate;
