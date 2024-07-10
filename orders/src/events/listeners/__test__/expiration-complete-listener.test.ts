import { ExpirationCompleteEvent } from "@tazosoraginasition/common";
import mongoose from "mongoose";
import { Message } from 'node-nats-streaming';
import { Order, OrderStatus } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client)

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 200,
    title: "das"
  })

  await ticket.save()

  const order = Order.build({
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket,
    userId: "das"
  })

  await order.save()

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id
  }

  const msg = {
    ack: jest.fn()
  } as unknown as Message

  return {
    listener,
    order,
    ticket,
    data,
    msg
  }
}

it("updates the order status to cancelled", async () => {
  const { listener, data, msg, order, ticket } = await setup()

  await listener.onMessage(data, msg)

  const fetchedOrder = await Order.findById(order.id)

  expect(fetchedOrder?.status).toEqual(OrderStatus.Cancelled)
})

it("emit on order cancel event", async () => {
  const { listener, data, msg, order, ticket } = await setup()

  await listener.onMessage(data, msg)

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

  expect(eventData.id).toBe(order.id)
  expect(eventData.ticket.id).toBe(ticket.id)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it("ack the message", async () => {
  const { listener, data, msg, order, ticket } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})