import jwt from "jsonwebtoken";
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.mock("../nats-wrapper")

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_KEY = "asdas"
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
})

beforeEach(async () => {
  jest.clearAllMocks()
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
global.signin = () => {
  const user = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@gmail.com"
  }

  const signedUser = jwt.sign(user, process.env.JWT_KEY!)
  const session = { jwt: signedUser }
  const sessionJSON = JSON.stringify(session)
  const base64SessionJSON = Buffer.from(sessionJSON).toString("base64")
  return [`session=${base64SessionJSON}`]
}
