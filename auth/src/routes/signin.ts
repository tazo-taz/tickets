import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from "jsonwebtoken";
import { BadRequesterror } from '@tazosoraginasition/common';
import { validateRequest } from '@tazosoraginasition/common';
import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

router.post('/api/users/signin', [
  body("email")
    .isEmail()
    .withMessage("Email must be a valid"),
  body("password")
    .isLength({ min: 4, max: 20 })
    .withMessage("Password must be between 4 and 20 characters")
],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (!existingUser) {
      throw new BadRequesterror("Invalid Credentials")
    }

    const passwordMatch = await Password.compare(existingUser.password, password)
    if (!passwordMatch) {
      throw new BadRequesterror("Invalid Credentials")
    }

    const userJwt = jwt.sign({
      id: existingUser.id,
      email: existingUser.email
    }, process.env.JWT_KEY!)

    req.session = {
      jwt: userJwt
    }

    res.status(200).send(existingUser)
  });

export { router as signinRouter };

