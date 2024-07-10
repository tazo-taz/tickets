import mongoose from "mongoose"
import request from "supertest"
import { app } from "../../app"

it("returns 404 if the ticket not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .get(`/api/tickets/${id}`)
    .send({})
    .expect(404)
})

it("returns ticket if found", async () => {
  // @ts-ignore
  const cookies = global.signin()

  const obj = {
    title: "hello",
    price: 200
  }

  const newTicketResponse = await request(app)
    .post("/api/tickets")
    .send(obj)
    .set("Cookie", cookies)
    .expect(201)

  const response = await request(app)
    .get(`/api/tickets/${newTicketResponse.body.id}`)
    .send()
    .expect(200)


  expect(response.body.title).toEqual(obj.title)
  expect(response.body.price).toEqual(obj.price)
})