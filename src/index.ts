import express from "express";
import authRouter from "./db/routers/auth-router";
import errorHandler from "./db/middleware/error";
import dotenv from 'dotenv';
import userRouter from "./db/routers/user-router";
dotenv.config();

const app = express();
const port = 5502;

app.use(express.json());
app.use(authRouter);

app.use(userRouter);

app.use(errorHandler);

app.listen(port, () => console.log(`Listening to port ${port}`));
