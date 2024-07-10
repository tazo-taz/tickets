import request from "supertest"
import { app } from "../../app"

const createTicket = () => {
  // @ts-ignore
  const cookies = global.signin()
  return request(app)
    .post('/api/tickets')
    .send({
      title: "Ticket 1",
      price: 10
    })
    .set("Cookie", cookies)
    .expect(201)
}

it("can fetch a list of tickets", async () => {

  await createTicket()
  await createTicket()
  await createTicket()

  const response = await request(app)
    .get("/api/tickets")
    .send()
    .expect(200)

  expect(response.body.length).toEqual(3)
})