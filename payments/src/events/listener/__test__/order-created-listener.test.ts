import { OrderStatus } from "@tazosoraginasition/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"
import { Order } from "../../../models/order"

const setup = async () => {
  const obj = {
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 100,
    status: OrderStatus.Created,
    userId: "fds",
    version: 0,
    expriresAt: ""
  }

  const msg = {
    ack: jest.fn()
  } as unknown as Message

  await new OrderCreatedListener(natsWrapper.client).onMessage({
    ...obj,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: obj.price
    }
  }, msg)

  return {
    obj,
    msg
  }
}

it("created order when events get", async () => {
  const { obj } = await setup()

  const order = await Order.findById(obj.id)

  expect(order).toBeDefined()
})

it("ack events", async () => {
  const { msg } = await setup()

  expect(msg.ack).toHaveBeenCalled()
})