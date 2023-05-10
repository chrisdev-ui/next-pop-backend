import { PAYPAL_WEBHOOK_TYPE } from '../config.js'
import Order from '../db/models/Order.js'
import Shipment from '../db/models/Shipment.js'
import User from '../db/models/User.js'
import {
  createShipmentItem,
  validateIfUserWantSending
} from '../graphql/utils/sendings.js'
import MiPaqueteController from './mipaquete-controller.js'

const Paypal = {}

const webhookController = async (req, res) => {
  try {
    const {
      body: {
        resource_type: resourceType,
        event_type: eventType,
        summary,
        resource
      }
    } = req
    switch (resourceType) {
      case PAYPAL_WEBHOOK_TYPE.CHECKOUT_ORDER: {
        const { id: paymentID, status, payer } = resource
        const isApprovedPayment = status === 'APPROVED'
        const orders = await Order.find({ paymentResult: { id: paymentID } })
        orders.forEach(async (order) => {
          if (!order.isPaid) {
            order.isPaid = isApprovedPayment
            order.paidAt = isApprovedPayment ? Date.now() : null
            order.paymentResult = {
              id: paymentID,
              order: {
                id: paymentID,
                type: eventType
              },
              status,
              result: summary,
              payer: {
                firstName: payer?.name.given_name || '',
                lastName: payer?.name.surname || '',
                email: payer?.email_address || '',
                phone: 'Paypal does not support phone numbers',
                identification: {
                  number: `Paypal payer ID: ${payer.payer_id}`
                }
              }
            }
            await order.save()
            const existOneShipment = await Shipment.findOne({
              order: order._id
            })
            if (!existOneShipment) {
              const currentUser = await User.findById(order.user)
              if (validateIfUserWantSending(order)) {
                const shipment = createShipmentItem(order, currentUser)
                const newShipping = new Shipment({ ...shipment })
                const sendingInput = {
                  sender: newShipping.sender,
                  receiver: newShipping.receiver,
                  productInformation: newShipping.productInformation,
                  locate: newShipping.locate,
                  channel: newShipping.channel,
                  ...(newShipping.user && { user: newShipping.user }),
                  deliveryCompany: newShipping.deliveryCompany,
                  ...(newShipping.description && {
                    description: newShipping.description
                  }),
                  ...(newShipping.comments && {
                    comments: newShipping.comments
                  }),
                  paymentType: newShipping.paymentType,
                  valueCollection: newShipping.valueCollection,
                  requestPickup: newShipping.requestPickup,
                  adminTransactionData: newShipping.adminTransactionData
                }
                const { data, error } = await MiPaqueteController.createSending(
                  sendingInput
                )
                if (error) {
                  newShipping.status = error.message
                  await newShipping.save()
                } else {
                  const { mpCode, message } = data
                  newShipping.trackingNumber = mpCode
                  newShipping.status = message
                  await newShipping.save()
                }
              }
            } else if (existOneShipment && !existOneShipment.trackingNumber) {
              const sendingInput = {
                sender: existOneShipment.sender,
                receiver: existOneShipment.receiver,
                productInformation: existOneShipment.productInformation,
                locate: existOneShipment.locate,
                channel: existOneShipment.channel,
                ...(existOneShipment.user && { user: existOneShipment.user }),
                deliveryCompany: existOneShipment.deliveryCompany,
                ...(existOneShipment.description && {
                  description: existOneShipment.description
                }),
                ...(existOneShipment.comments && {
                  comments: existOneShipment.comments
                }),
                paymentType: existOneShipment.paymentType,
                valueCollection: existOneShipment.valueCollection,
                requestPickup: existOneShipment.requestPickup,
                adminTransactionData: existOneShipment.adminTransactionData
              }
              const { data, error } = await MiPaqueteController.createSending(
                sendingInput
              )
              if (error) {
                existOneShipment.status = error.message
                await existOneShipment.save()
              } else {
                const { mpCode, message } = data
                existOneShipment.trackingNumber = mpCode
                existOneShipment.status = message
                await existOneShipment.save()
              }
            }
          }
        })
        break
      }

      default: {
        break
      }
    }
    res.status(200).send('Notification received')
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
}

Paypal.webhookController = webhookController

export default Paypal
