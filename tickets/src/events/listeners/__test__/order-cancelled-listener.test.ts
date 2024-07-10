import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from "@tazosoraginasition/common"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"
import mongoose from "mongoose"

const setup = async () => {
  const ticket = Ticket.build({
    price: 100,
    title: "das",
    userId: "das"
  })

  await ticket.save()

  const data: OrderCancelledEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: ticket.id
    },
    version: 0
  }

  const msg = {
    ack: jest.fn()
  } as unknown as Message

  await new OrderCancelledListener(natsWrapper.client).onMessage(data, msg)

  return {
    ticket,
    msg
  }
}

it("cancelles order", async () => {
  const { ticket } = await setup()

  let fetchedTicket = (await Ticket.findById(ticket.id))!

  expect(fetchedTicket.orderId).toBe(undefined)
})

it("acks", async () => {
  const { msg } = await setup()

  expect(msg.ack).toHaveBeenCalled()

  const arg = JSON.parse((natsWrapper.client.publish as any).mock.calls[0][1])
  expect(arg.orderId).toBe(undefined)
})

it("events emits with orderId undefined", async () => {
  await setup()

  const arg = JSON.parse((natsWrapper.client.publish as any).mock.calls[0][1])
  expect(arg.orderId).toBe(undefined)
})