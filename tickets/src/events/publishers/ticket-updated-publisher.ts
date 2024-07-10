import { Publisher, Subjects, TicketUpdatedEvent } from "@tazosoraginasition/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}