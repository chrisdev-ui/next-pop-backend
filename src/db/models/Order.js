import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, default: '' },
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        slug: { type: String, required: true }
      }
    ],
    shippingInfo: {
      fullName: { type: String, required: true },
      cellPhone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      department: { type: String, required: true },
      country: { type: String, required: true, default: 'Colombia' },
      nit: { type: String },
      nitType: {
        type: String,
        enum: ['NIT', 'CC', 'CE', 'TI']
      },
      isCashOnDelivery: { type: Boolean, required: true, default: false },
      deliveryCompany: { type: String },
      shippingCost: { type: Number }
    },
    paymentResult: {
      id: { type: String },
      order: { id: { type: String }, type: { type: String } },
      status: { type: String },
      result: { type: String },
      payer: {
        firstName: String,
        email: String,
        lastName: String,
        phone: String,
        identification: {
          number: { type: String },
          type: { type: String }
        }
      }
    },
    paymentMethod: { type: String, required: true },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    isDelivered: { type: Boolean, required: true, default: false },
    paidAt: { type: Date, default: null },
    deliveredAt: { type: Date }
  },
  { timestamps: true }
)

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export default Order
