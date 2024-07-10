import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { signin } from "../../test/utils"
import { Ticket } from "../../models/ticket"
import { Order, OrderStatus } from "../../models/order"
import { natsWrapper } from "../../nats-wrapper"
import { generateTicket } from "./utils"

it("returns an error if ticket does not exists", async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString()

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId })
    .expect(404)
})

it("returns an error if ticket already exists", async () => {
  const ticket = await generateTicket()

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(400)

})

it("reserves a ticket", async () => {
  const ticket = await generateTicket()

  const cookie = signin()
  const { body: createBody } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(201)

  expect(createBody.ticket.title).toBe(ticket.title)
  expect(createBody.ticket.price).toBe(ticket.price)
  expect(createBody.status).toBe(OrderStatus.Created)
})

it("emits an order created event", async () => {
  const ticket = await generateTicket()

  const cookie = signin()
  const { body: createBody } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
