import { BadRequesterror, NotAuthorizedError, NotFoundError, OrderStatus, requreAuth, validateRequest } from "@tazosoraginasition/common";
import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payments";
import { PaymentCreatedPublisher } from "../events/publisher/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = Router()

router.post(
  "/api/payments",
  requreAuth,
  [
    body("token")
      .not()
      .isEmpty(),
    body("orderId")
      .not()
      .isEmpty(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body

    const order = await Order.findById(orderId)

    if (!order) {
      throw new NotFoundError()
    }
    if (order.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError()
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequesterror("Can not pay for cancelled order")
    }

    const { id: stripeId } = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token
    })

    const payment = Payment.build({
      orderId: order.id,
      stripeId
    })

    await payment.save()

    await new PaymentCreatedPublisher(natsWrapper.client).publish(payment)

    res.status(201).send({ id: payment.id })
  }
)

export { router as CreateChargeRouter }