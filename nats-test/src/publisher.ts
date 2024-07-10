import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear()


const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222"
})

stan.on("connect", async () => {
  console.log("publisher connected to nats");

  const obj = {
    id: "123",
    title: "Concert",
    price: 200
  }

  const publisher = new TicketCreatedPublisher(stan)

  try {
    await publisher.publish(obj)
  } catch (error) {
    console.log(error);
  }
  // stan.publish("ticket:created", obj, () => {
  //   console.log("ticker created published");

  // })

})