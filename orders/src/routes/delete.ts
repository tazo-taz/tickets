import { BadRequesterror, NotAuthorizedError, NotFoundError, OrderStatus, requreAuth } from '@tazosoraginasition/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete("/api/orders/:orderId", requreAuth, async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.orderId).populate("ticket")

  if (!order) {
    throw new NotFoundError()
  }
  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError()
  }
  if (order.status === OrderStatus.Complete) {
    throw new BadRequesterror("Order is already completed")
  }

  order.status = OrderStatus.Cancelled
  await order.save()

  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id,
    },
  })

  res.status(204).send(order)
});

export { router as deleteOrderRouter }