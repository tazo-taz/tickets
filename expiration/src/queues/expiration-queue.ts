import Bull from "bull";
import { ExpirationCompletePublisher } from "../events/publisher/expiration-complete-publisher";
import { natsWrapper } from "../nats-wrapper";

interface Payload {
  orderId: string
}

const expirationQueue = new Bull<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST
  }
})

expirationQueue.process(async (job) => {
  console.log("job is here", job.data.orderId);

  await new ExpirationCompletePublisher(natsWrapper.client).publish({ orderId: job.data.orderId })
})

export { expirationQueue }