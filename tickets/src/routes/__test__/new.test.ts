import request from "supertest"
import { app } from "../../app"
import { Ticket } from "../../models/ticket"
import { natsWrapper } from "../../nats-wrapper"

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .send({})

  expect(response.status).not.toEqual(404)
})

it("can only be accessed if the user is signed in", async () => {
  await request(app)
    .post("/api/tickets")
    .send({})
    .expect(401)
})

it("returns status code other than 401 if user is signed in", async () => {
  // @ts-ignore
  const cookies = global.signin()
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookies)
    .send({})

  expect(response.status).not.toEqual(401)
})

it("returns an error if an invalid title is provider", async () => {
  // @ts-ignore
  const cookies = global.signin()

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookies)
    .send({
      title: "",
      price: 3123
    })
    .expect(400)

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookies)
    .send({
      price: 3123
    })
    .expect(400)
})

it("returns an error if an invalid price is provider", async () => {
  // @ts-ignore
  const cookies = global.signin()

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookies)
    .send({
      title: "dasdas",
      price: -100
    })
    .expect(400)

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookies)
    .send({
      title: "dasdas",
    })
    .expect(400)
})

it("creates a ticker with valid inputs", async () => {
  // @ts-ignore
  const cookies = global.signin()

  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0)

  const ticketAddObj = {
    title: "hello",
    price: 20
  }

  await request(app)
    .post("/api/tickets")
    .send(ticketAddObj)
    .set("Cookie", cookies)
    .expect(201)


  tickets = await Ticket.find({});

  expect(tickets.length).toEqual(1)
  expect(tickets[0].title).toEqual(ticketAddObj.title)
  expect(tickets[0].price).toEqual(ticketAddObj.price)
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