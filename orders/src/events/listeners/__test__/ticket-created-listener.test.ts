import { Message } from 'node-nats-streaming';
import { natsWrapper } from "../../../nats-wrapper"
import { TicketCreatedListener } from "../ticket-created-listener"
import { Ticket } from '../../../models/ticket';

const setup = () => {
  const data = {
    title: "concert",
    id: "6689602dc6d8b49e20f9cff9",
    price: 23,
    userId: "",
    version: 0
  }
  const listener = new TicketCreatedListener(natsWrapper.client)
  const msg = {
    ack: jest.fn()
  } as unknown as Message
  return {
    listener,
    data,
    msg
  }
}

it("creates and saves ticket", async () => {
  const { data, listener, msg } = setup()

  await listener.onMessage(
    data,
    msg
  )

  const ticket = (await Ticket.findById(data.id))!

  expect(ticket).toBeDefined()
  expect(ticket.title).toEqual(data.title)
  expect(ticket.price).toEqual(data.price)
})

it("acks the message", async () => {
  const { data, listener, msg } = setup()

  await listener.onMessage(
    data,
    msg
  )

  expect(msg.ack).toHaveBeenCalled()
})