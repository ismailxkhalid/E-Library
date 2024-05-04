import Jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { config } from '../config/config';

export interface AuthRequest extends Request {
    userId: string;
}

const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.header('Authorization');
    if (!token) {
        return next(createHttpError(401, 'Authorization token required'));
    }

    try {
        const parsedToken = token.split(' ')[1];
        const decoded = Jwt.verify(parsedToken, config.secret as string);

        const _req = req as AuthRequest;
        _req.userId = decoded.sub as string;
        next();
    } catch (error) {
        return next(createHttpError(401, error as string));
    }
};

export default authenticate;
