import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';
import "express-async-errors";
import { NotFoundError, errorHandler, currentUser } from '@tazosoraginasition/common';
import { CreateChargeRouter } from './routes/new';

const app = express();

app.set("trust proxy", 1)
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== "test"
}))
app.use(currentUser)

app.use(CreateChargeRouter)

app.all("/*", async () => {
  throw new NotFoundError()
})

app.use(errorHandler)

export { app };
