import { ExpirationCompleteEvent, Publisher, Subjects } from '@tazosoraginasition/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}