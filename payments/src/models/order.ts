import { OrderStatus } from "@tazosoraginasition/common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface OrderAttrs {
  id: string,
  version: number,
  price: number,
  userId: string,
  status: OrderStatus
}

interface OrderDoc extends mongoose.Document {
  version: number,
  price: number,
  userId: string,
  status: OrderStatus
}

interface findByEventParams {
  id: string,
  version: number
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc
  findByEvent(attrs: findByEventParams): Promise<OrderDoc>
}

const schema = new mongoose.Schema({
  price: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id
      delete ret._id
    }
  }
})

schema.set("versionKey", "version")
schema.plugin(updateIfCurrentPlugin)

schema.statics.build = ({ id, ...attrs }: OrderAttrs) => {
  return new Order({
    _id: id,
    ...attrs
  })
}

schema.statics.findByEvent = ({ id, version }: findByEventParams) => {
  return Order.findOne({
    _id: id,
    version: version - 1
  })
}

const Order = mongoose.model<OrderDoc, OrderModel>("Order", schema)

export { Order }