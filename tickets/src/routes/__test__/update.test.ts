import { signin } from './../../../../orders/src/test/utils';
import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { natsWrapper } from "../../nats-wrapper"
import { Ticket } from "../../models/ticket"

it("returns a 404 if provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  // @ts-ignore
  const cookies = global.signin()

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "Titlxxxe",
      price: 2221
    })
    .set("Cookie", cookies)
    .expect(404)
})

it("returns a 401 if user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString()

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "Title",
      price: 22
    })
    .send()
    .expect(401)
})

it("returns a 401 if user does not own the ticket", async () => {
  // @ts-ignore
  const cookies1 = global.signin()
  // @ts-ignore
  const cookies2 = global.signin()

  const res = await request(app)
    .post("/api/tickets")
    .send({
      title: "xxx",
      price: 12
    })
    .set("Cookie", cookies1)
    .expect(201)

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .send({
      title: "qqq",
      price: 44
    })
    .set("Cookie", cookies2)
    .expect(401)

})

it("returns a 400 if user provides invalid title or price", async () => {
  // @ts-ignore
  const cookies = global.signin()
  const res = await request(app)
    .post("/api/tickets")
    .send({
      title: "xasdas",
      price: 22
    })
    .set("Cookie", cookies)
    .expect(201)

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .send({
      title: "dasda",
      price: -20
    })
    .set("Cookie", cookies)
    .expect(400)

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .send({
      title: "",
      price: 20
    })
    .set("Cookie", cookies)
    .expect(400)

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .send({
      title: "",
      price: -20
    })
    .set("Cookie", cookies)
    .expect(400)
})

it("returns updates a ticker when providing valid title and price", async () => {
  // @ts-ignore
  const cookies = global.signin()
  const res = await request(app)
    .post("/api/tickets")
    .send({
      title: "xasdas",
      price: 22
    })
    .set("Cookie", cookies)
    .expect(201)

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .send({
      title: "test20",
      price: 20
    })
    .set("Cookie", cookies)
    .expect(200)


  const getTicketRes = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookies)
    .expect(200)

  expect(getTicketRes.body.title).toEqual("test20")
  expect(getTicketRes.body.price).toEqual(20)
})

it("publishes an event", async () => {
  // @ts-ignore
  const cookies = global.signin()

  const title = "Concert"
  await request(app)
    .post("/api/tickets")
    .send({
      title,
      price: 123
    })
    .set("Cookie", cookies)
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it("it throw an error when ticker is reserved", async () => {
  // @ts-ignore
  const cookies = global.signin()

  const { body: ticket } = await request(app)
    .post("/api/tickets")
    .send({
      title: "das",
      price: 123
    })
    .set("Cookie", cookies)
    .expect(201);

  await Ticket.updateOne({ _id: ticket.id }, { orderId: new mongoose.Types.ObjectId().toHexString() })

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookies)
    .send({
      price: 6000,
      title: "hello"
    })
    .expect(400)
})