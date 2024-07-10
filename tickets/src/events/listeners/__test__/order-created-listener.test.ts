import { Message } from 'node-nats-streaming';
import { OrderStatus } from "@tazosoraginasition/common"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"

const setup = async () => {
  const ticket = Ticket.build({
    price: 200,
    title: "hello",
    userId: "das"
  })

  await ticket.save()

  const order = {
    id: "12345",
    expriresAt: "31232131",
    status: OrderStatus.Created,
    ticket: {
      id: ticket.id,
      price: ticket.price
    },
    userId: "3123",
    version: 0,
  }

  const msg = {
    ack: jest.fn()
  } as unknown as Message

  return {
    order,
    msg,
    ticket
  }
}

it("changes orderId when order created listened", async () => {
  const { msg, order, ticket } = await setup()

  await new OrderCreatedListener(natsWrapper.client).onMessage(order, msg)

  const ticketFetched = (await Ticket.findById(ticket.id))!

  expect(ticketFetched.orderId).toEqual(order.id)
})

it("acks the message", async () => {
  const { msg, order } = await setup()

  await new OrderCreatedListener(natsWrapper.client).onMessage(order, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it("ticketsUpdatedPublisher called", async () => {
  const { msg, order } = await setup()

  await new OrderCreatedListener(natsWrapper.client).onMessage(order, msg)

  expect(msg.ack).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalled()

  // @ts-ignore
  const args = JSON.parse(natsWrapper.client.publish.mock.calls[0][1])

  expect(args.orderId).toBe(order.id)
})