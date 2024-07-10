import { Listener, Subjects, TicketUpdatedEvent } from "@tazosoraginasition/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
  queueGroupName = queueGroupName

  async onMessage({ id, price, title, version }: TicketUpdatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findByEvent({ id, version });

    if (!ticket) {
      throw new Error("Ticket not found")
    }

    ticket.set({ title, price })
    await ticket.save()

    msg.ack()
  }
}