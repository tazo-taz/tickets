import { OrderCancelledEvent, OrderStatus } from "@tazosoraginasition/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { OrderCancelledListener } from "../order-cancelled-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Order } from "../../../models/order"

const setup = async () => {
  const data: OrderCancelledEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: "das"
    },
    version: 1
  }

  const order = Order.build({
    id: data.id,
    price: 200,
    status: OrderStatus.Created,
    userId: "das",
    version: 0
  })

  await order.save()

  const msg = {
    ack: jest.fn()
  } as unknown as Message

  await new OrderCancelledListener(natsWrapper.client).onMessage(data, msg)

  return {
    data,
    msg
  }
}

it("cancels order when event emits", async () => {
  const { data } = await setup()

  const order = await Order.findById(data.id)

  expect(order?.status).toBe(OrderStatus.Cancelled)
})

it("ack events", async () => {
  const { msg } = await setup()

  expect(msg.ack).toHaveBeenCalled()
})