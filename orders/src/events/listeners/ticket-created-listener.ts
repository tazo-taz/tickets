import { Listener, Subjects, TicketCreatedEvent } from "@tazosoraginasition/common"
import { Message } from "node-nats-streaming"
import { queueGroupName } from "./queue-group-name"
import { Ticket } from "../../models/ticket"

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
  queueGroupName = queueGroupName

  async onMessage({ title, price, id }: TicketCreatedEvent["data"], msg: Message) {
    const ticket = Ticket.build({
      title, price, id
    })
    await ticket.save()

    msg.ack()
  }
}