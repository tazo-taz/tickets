import request from "supertest";
import { app } from "../../app";

it("fails when email does not exist", () => {
  return request(app)
    .post("/api/users/signin")
    .send({
      email: "test@gmail.com",
      password: "password"
    })
    .expect(400)
})

it("fails when email exist and password is incorrect", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@gmail.com",
      password: "password"
    })
    .expect(201);

  return request(app)
    .post("/api/users/signin")
    .send({
      email: "test@gmail.com",
      password: "password123"
    })
    .expect(400)
})

it("successfully signup and signin", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@gmail.com",
      password: "password"
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@gmail.com",
      password: "password"
    })
    .expect(200)

  expect(response.get("Set-Cookie")).toBeDefined()
})