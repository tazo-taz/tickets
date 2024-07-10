import { Message } from 'node-nats-streaming';
import { natsWrapper } from "../../../nats-wrapper"
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import mongoose from 'mongoose';

const setup = async () => {
  const data = {
    title: "concert",
    price: 23,
    userId: "sdfafsasaf",
    id: new mongoose.Types.ObjectId().toHexString()
  }
  const ticket = Ticket.build(data)
  await ticket.save()
  const listener = new TicketUpdatedListener(natsWrapper.client)
  const msg = {
    ack: jest.fn()
  } as unknown as Message
  return {
    listener,
    data,
    msg,
    ticket
  }
}

it("creates then updates and saves ticket", async () => {
  const { data, listener, msg, ticket } = await setup()

  ticket.set({ price: 1234 })
  await ticket.save()

  await listener.onMessage(
    { ...data, version: ticket.version + 1, id: ticket.id },
    msg
  )

  const ticketSearched = (await Ticket.findById(ticket.id))!

  expect(ticketSearched.version).toBe(2)
})

it("it throw an error when version does not match on creates then updates and saves ticket", async () => {
  const { data, listener, msg, ticket } = await setup()

  ticket.set({ price: 1234 })
  await ticket.save()

  try {

    await listener.onMessage(
      { ...data, version: ticket.version + 5, id: ticket.id },
      msg
    )
  } catch (error) {
    return true
  }
  throw new Error("Should not reach this point")
})

it("acks the message", async () => {
  const { data, listener, msg, ticket } = await setup()

  await listener.onMessage(
    { ...data, version: ticket.version + 1, id: ticket.id },
    msg
  )

  expect(msg.ack).toHaveBeenCalled()
})