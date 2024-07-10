import request from "supertest";
import { app } from "../../app";

it("fails when email does not exist", async () => {
  // @ts-ignore
  const cookie = await global.signin();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .expect(200)

  expect(response.body.currentUser.email).toEqual("test@test.com")
})

it("fails when email does not exist", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .expect(200)

  expect(response.body.currentUser).toEqual(null);
})