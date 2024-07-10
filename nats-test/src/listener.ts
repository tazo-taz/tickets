import { randomBytes } from "crypto";
import nats from "node-nats-streaming";
import { TicketCreatedListener } from "./events/ticket-created-listener";

console.clear()

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222"
})

stan.on("connect", () => {
  console.log("listener connected to nats");

  stan.on("close", () => {
    console.log("nats connection closed");
    process.exit();
  })

  new TicketCreatedListener(stan).listen()

})

process.on('SIGINT', () => {
  stan.close()
})
process.on('SIGTERM', () => {
  stan.close()
})

// video 10
// to run nats: k port-forward nats-depl-7475c78cd5-cnv9j 4222:4222



