import mongoose from 'mongoose'

const shipmentSchema = new mongoose.Schema(
  {
    trackingNumber: { type: Number, required: true, default: 0 },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    sender: {
      name: { type: String, required: true, default: 'Paula Morales' },
      surname: { type: String, required: true, default: '.' },
      cellPhone: { type: String, required: true, default: '3142829044' },
      prefix: { type: String, required: true, default: '+57' },
      email: {
        type: String,
        required: true,
        default: 'papeleria.pdepapel@gmail.com'
      },
      pickupAddress: {
        type: String,
        required: true,
        default: 'Calle 12 AA Sur #55D-30'
      },
      nit: {
        type: String,
        default: '1030579584'
      },
      nitType: {
        type: String,
        enum: ['NIT', 'CC', 'CE', 'TI'],
        default: 'CC'
      }
    },
    receiver: {
      name: { type: String, required: true },
      surname: { type: String, required: true, default: '.' },
      email: { type: String, required: true },
      prefix: { type: String, required: true, default: '+57' },
      cellPhone: { type: String, required: true },
      destinationAddress: { type: String, required: true },
      nit: { type: String },
      nitType: {
        type: String,
        enum: ['NIT', 'CC', 'CE', 'TI']
      }
    },
    productInformation: {
      quantity: { type: Number, required: true, default: 1 },
      width: { type: Number, required: true },
      large: { type: Number, required: true },
      height: { type: Number, required: true },
      weight: { type: Number, required: true },
      forbiddenProduct: { type: Boolean, default: true },
      productReference: { type: String },
      declaredValue: { type: Number, required: true, default: 10000 }
    },
    locate: {
      originDaneCode: {
        type: String,
        required: true,
        description: 'código DANE de ciudad o municipio origen'
      },
      destinyDaneCode: {
        type: String,
        required: true,
        description: 'código DANE de ciudad o municipio destino'
      }
    },
    channel: { type: String, required: true, default: 'Papelería P de Papel' },
    user: {
      type: String,
      description: 'ID del usuario en mipaquete (no es obligatorio)'
    },
    deliveryCompany: {
      type: String,
      required: true,
      description: 'ID de la transportadora'
    },
    description: { type: String },
    comments: { type: String },
    paymentType: {
      type: Number,
      required: true,
      enum: [101, 102],
      default: 101,
      description:
        'Tipo de pago 101- pago con saldo de mipaquete o 102 - Descontando el envío del recaudo realizado(aplica para pagocontraentrega)'
    },
    valueCollection: {
      type: Number,
      required: true,
      default: 0,
      description:
        'Valor a recaudar si el envío es con modalidad de pago contraentrega, si no, se coloca 0'
    },
    requestPickup: {
      type: Boolean,
      required: true,
      default: true,
      description:
        'Si desea solicitar servicio de recolección del paquete en dirección origen'
    },
    adminTransactionData: {
      saleValue: {
        type: Number,
        required: true,
        default: 0,
        description:
          'Valor de la venta del producto a enviar (aplica para servicio de pago contraentrega, si no se coloca 0)'
      }
    },
    pickupDate: { type: Date },
    deliveryDate: { type: Date },
    isCashOnDelivery: { type: Boolean, required: true, default: false },
    status: {
      type: String,
      required: true,
      default: 'No hay un envio asociado a este registro'
    }
  },
  { timestamps: true }
)

const Shipment =
  mongoose.models.Shipment || mongoose.model('Shipment', shipmentSchema)

export default Shipment
