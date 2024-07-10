import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { signin } from "../../test/utils"
import { Ticket } from "../../models/ticket"
import { Order, OrderStatus } from "../../models/order"
import { generateTicket } from "./utils"



it("returns an error if ticket does not exists", async () => {

  const ticket1 = await generateTicket()
  const ticket2 = await generateTicket()
  const ticket3 = await generateTicket()

  const user1cookie = signin()
  const user2cookie = signin()

  const { body: order1 } = await request(app)
    .post("/api/orders")
    .set("Cookie", user1cookie)
    .send({ ticketId: ticket1.id })
    .expect(201)

  const { body: order2 } = await request(app)
    .post("/api/orders")
    .set("Cookie", user2cookie)
    .send({ ticketId: ticket2.id })
    .expect(201)

  const { body: order3 } = await request(app)
    .post("/api/orders")
    .set("Cookie", user2cookie)
    .send({ ticketId: ticket3.id })
    .expect(201);

  const { body: user2Orders } = await request(app)
    .get("/api/orders")
    .set("Cookie", user2cookie)
    .expect(200)

  const { body: user1Orders } = await request(app)
    .get("/api/orders")
    .set("Cookie", user1cookie)
    .expect(200)

  expect(user2Orders.length).toBe(2)
  expect(order2.id).toBe(user2Orders[0].id)
  expect(order2.ticket.id).toBe(ticket2.id)
  expect(order3.id).toBe(user2Orders[1].id)
  expect(order3.ticket.id).toBe(ticket3.id)

  expect(user1Orders.length).toBe(1)
  expect(order1.id).toBe(user1Orders[0].id)
  expect(order1.ticket.id).toBe(ticket1.id)
})