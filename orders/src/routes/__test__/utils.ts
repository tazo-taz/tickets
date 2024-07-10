import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";

let ticketCount = 0;

export const generateTicket = async () => {
  const ticket = Ticket.build({
    price: Math.floor(Math.random() * 100) + 100,
    title: "Concert" + ++ticketCount,
    id: new mongoose.Types.ObjectId().toHexString()
  })

  await ticket.save();
  return ticket
}