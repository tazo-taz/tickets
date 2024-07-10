import { BadRequesterror, NotAuthorizedError, NotFoundError, requreAuth, validateRequest } from "@tazosoraginasition/common"
import express, { Request, Response } from "express"
import { body } from "express-validator"
import { Ticket } from "../models/ticket"
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher"
import { natsWrapper } from "../nats-wrapper"

const router = express.Router()

router.put("/api/tickets/:id", requreAuth, [
  body("title").not().isEmpty().withMessage("Title is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0")
], validateRequest, async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id)

  if (!ticket) {
    throw new NotFoundError()
  }

  if (ticket.userId !== req.currentUser?.id) {
    throw new NotAuthorizedError()
  }

  if (ticket.orderId) {
    throw new BadRequesterror("This ticket is reserved")
  }

  ticket.set({
    title: req.body.title,
    price: req.body.price
  })

  await ticket.save()

  await new TicketUpdatedPublisher(natsWrapper.client).publish({
    id: req.params.id,
    price: ticket.price,
    title: ticket.title,
    version: ticket.version,
    userId: ticket.userId
  })

  res.send(ticket)
})

export { router as updateTicketRouter }
