import mongoose from "mongoose"
import jwt from "jsonwebtoken";

export const signin = () => {
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