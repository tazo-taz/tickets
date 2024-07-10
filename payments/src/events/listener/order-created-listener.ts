import { Listener, OrderCreatedEvent, Subjects } from "@tazosoraginasition/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName

  async onMessage({ id, status, ticket: { price }, userId, version }: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id,
      price,
      status,
      userId,
      version
    })

    await order.save()

    msg.ack()
  }
}