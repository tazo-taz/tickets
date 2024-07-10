import { OrderCancelledEvent, Publisher, Subjects } from "@tazosoraginasition/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}