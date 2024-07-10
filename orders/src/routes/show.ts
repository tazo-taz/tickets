import { NotAuthorizedError, NotFoundError, requreAuth } from '@tazosoraginasition/common';
import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { Order } from '../models/order';

const router = express.Router();

router.get("/api/orders/:orderId",
  requreAuth,
  [
    param("orderId")
      .isMongoId()
      .withMessage("orderId must be a valid mongoId")
  ],
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket")

    if (!order) {
      throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    res.send(order)
  });

export { router as showOrderRouter }