import request from "supertest"
import { app } from "../../app"
import { generateTicket } from "./utils"
import { Order } from "../../models/order"
import { signin } from "../../test/utils"

it("fetches the order", async () => {
  const ticket = await generateTicket()
  const userCookie = signin()

  const { body: order } = await request(app)
    .post("/api/orders")
    .send({
      ticketId: ticket.id
    })
    .set("Cookie", userCookie)
    .expect(201)

  const { body: orderDetails } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", userCookie)
    .expect(200)

  expect(orderDetails.id).toEqual(order.id)
})

it("it fetches an error if user1 tries fetch user2 order", async () => {
  const ticket = await generateTicket()
  const user1Cookie = signin()
  const user2Cookie = signin()

  const { body: order } = await request(app)
    .post("/api/orders")
    .send({
      ticketId: ticket.id
    })
    .set("Cookie", user1Cookie)
    .expect(201)

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user2Cookie)
    .expect(401)
})