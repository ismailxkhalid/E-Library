import express from 'express';
import cors from 'cors';
import golbalErrorHandler from './middleware/golbalErrorHandler';
import { userRouter } from './routes/userRouter';
import { bookRouter } from './routes/bookRouter';
import { config } from './config/config';

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: config.frontendDomain
    })
);

app.get('/', (req, res) => {
    res.json({ message: 'E-Library for E-Books' });
});

// User Routes
app.use('/api/users', userRouter);

//Book Routes
app.use('/api/books', bookRouter);

// Golabal Error Handler Middleware
app.use(golbalErrorHandler);

export default app;
