import express from "express";
import authRouter from "./db/routers/auth-router";
import errorHandler from "./db/middleware/error";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 5502;

app.use(express.json());
app.use(authRouter);

app.use(errorHandler);

app.listen(port, () => console.log(`Escuchando al puerto ${port}`));
