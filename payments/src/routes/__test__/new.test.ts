import request from "supertest"
import { app } from "../../app"
import { signin } from "../../test/setup"
import mongoose from "mongoose"
import { Order } from "../../models/order"
import { OrderStatus } from "@tazosoraginasition/common"
import { stripe } from "../../stripe"
import { Payment } from "../../models/payments"

jest.mock("../../stripe")

it("throw an error for non existing order", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", signin())
    .send({ token: "das", orderId: new mongoose.Types.ObjectId().toHexString() })
    .expect(404)
})

it("returns 401 when purchasing an order that does not belong to user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    status: OrderStatus.Created,
    userId: "dasda",
    version: 0
  })

  await order.save()

  await request(app)
    .post("/api/payments")
    .set("Cookie", signin())
    .send({ token: "das", orderId: order.id })
    .expect(401)
})

it("returns 400 when purchasing a cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()
  const cookie = signin(userId)

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    status: OrderStatus.Cancelled,
    userId: userId,
    version: 0
  })

  await order.save()

  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({ token: "das", orderId: order.id })
    .expect(400)
})

it("returns a 201 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()
  const cookie = signin(userId)

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    status: OrderStatus.Created,
    userId: userId,
    version: 0
  })

  await order.save()

  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({ token: "tok_visa", orderId: order.id })
    .expect(201)

  const data = (stripe.charges.create as jest.Mock).mock.calls[0][0]

  expect(data.source).toBe("tok_visa")
  expect(data.amount).toBe(order.price * 100)
  expect(data.currency).toBe("usd")

  const payment = await Payment.findOne({ orderId: order.id })

  expect(payment).toBeDefined()
})