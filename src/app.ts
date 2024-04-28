import express from 'express';
import createHttpError from 'http-errors';
import golbalErrorHandler from './middleware/golbalErrorHandler';
import userRouter from './user/userRouter';

const app = express();

app.get('/', (req, res) => {
    res.json({ message: 'E-Library for E-Books' });
});

app.use(userRouter);

// Golabal Error Handler Middleware
app.use(golbalErrorHandler);

export default app;
