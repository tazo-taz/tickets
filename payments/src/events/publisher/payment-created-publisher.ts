import { PaymentCreatedEvent, Publisher, Subjects } from "@tazosoraginasition/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}