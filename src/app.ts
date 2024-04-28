import express from 'express';
import createHttpError from 'http-errors';
import golbalErrorHandler from './middleware/golbalErrorHandler';

const app = express();

app.get('/', (req, res) => {
    const error = createHttpError(404, 'Checking Global Error Middleware');
    throw error;
    res.json({ message: 'E-Library for E-Books' });
});

// Golabal Error Handler Middleware
app.use(golbalErrorHandler);

export default app;
