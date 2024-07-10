import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from "supertest"



let mongo: MongoMemoryServer;


beforeAll(async () => {
  process.env.JWT_KEY = "asdas"
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
})

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
})

afterAll(async () => {
  mongo.stop();
  mongoose.connection.close();
})

// @ts-ignore
global.signin = async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password"
    })
    .expect(201)

  const cookie = response.get("Set-Cookie")!
  return cookie
}
