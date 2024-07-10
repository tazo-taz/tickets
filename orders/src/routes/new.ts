import { BadRequesterror, NotFoundError, OrderStatus, requreAuth, validateRequest } from '@tazosoraginasition/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const EXPIRATION_WINDOW_SECONDS = 1 * 60

const router = express.Router();

router.post("/api/orders",
  requreAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body

    const ticket = await Ticket.findById(ticketId)

    if (!ticket) {
      throw new NotFoundError()
    }

    const isReserved = await ticket.isReserved()

    if (isReserved) {
      throw new BadRequesterror("Ticket is already reserved")
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    const order = Order.build({
      expiresAt: expiration,
      ticket,
      userId: req.currentUser!.id,
      status: OrderStatus.Created
    })

    await order.save();

    new OrderCreatedPublisher(natsWrapper.client).publish({
      expriresAt: order.expiresAt.toISOString(),
      id: order.id,
      status: order.status,
      version: order.version,
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
      userId: req.currentUser!.id
    })

    res.status(201).send(order)
  }
);



export { router as newOrderRouter };