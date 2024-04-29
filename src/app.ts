import express from 'express';
import golbalErrorHandler from './middleware/golbalErrorHandler';
import { userRouter } from './routes/userRoute';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'E-Library for E-Books' });
});

app.use('/api/users', userRouter);

// Golabal Error Handler Middleware
app.use(golbalErrorHandler);

export default app;
