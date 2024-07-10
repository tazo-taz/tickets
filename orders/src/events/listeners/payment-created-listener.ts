import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from "@tazosoraginasition/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated
  queueGroupName = queueGroupName

  async onMessage({ orderId }: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(orderId)

    if (!order) {
      throw new Error("Order not found")
    }

    order.set({
      status: OrderStatus.Complete
    })
    await order.save()

    msg.ack()
  }
}