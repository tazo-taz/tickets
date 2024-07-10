import request from "supertest"
import { app } from "../../app"
import { generateTicket } from "./utils"
import { signin } from "../../test/utils"
import { OrderStatus } from "@tazosoraginasition/common"
import { natsWrapper } from "../../nats-wrapper"

it("cancels order", async () => {
  const ticket = await generateTicket()
  const userCookie = signin()

  const { body: createdOrder } = await request(app)
    .post("/api/orders")
    .set("Cookie", userCookie)
    .send({
      ticketId: ticket.id
    })
    .expect(201)

  const { body: order } = await request(app)
    .get(`/api/orders/${createdOrder.id}`)
    .set("Cookie", userCookie)
    .expect(200)

  expect(order.id).toEqual(createdOrder.id)

  await request(app)
    .delete(`/api/orders/${createdOrder.id}`)
    .set("Cookie", userCookie)
    .expect(204)

  const { body } = await request(app)
    .get(`/api/orders/${createdOrder.id}`)
    .set("Cookie", userCookie)
    .expect(200)

  expect(body.id).toEqual(createdOrder.id)
  expect(body.status).toEqual(OrderStatus.Cancelled)
})

it("emits order as cancelled", async () => {
  const ticket = await generateTicket()
  const userCookie = signin()

  const { body: createdOrder } = await request(app)
    .post("/api/orders")
    .set("Cookie", userCookie)
    .send({
      ticketId: ticket.id
    })
    .expect(201)

  const { body: order } = await request(app)
    .get(`/api/orders/${createdOrder.id}`)
    .set("Cookie", userCookie)
    .expect(200)

  expect(order.id).toEqual(createdOrder.id)

  await request(app)
    .delete(`/api/orders/${createdOrder.id}`)
    .set("Cookie", userCookie)
    .expect(204)

  const { body } = await request(app)
    .get(`/api/orders/${createdOrder.id}`)
    .set("Cookie", userCookie)
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})