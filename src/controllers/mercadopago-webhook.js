import { ApolloError } from 'apollo-server-core'
import mercadopago from 'mercadopago'
import { PAYMENT, WEBHOOK_TYPE } from '../config.js'
import Order from '../db/models/Order.js'
import Shipment from '../db/models/Shipment.js'
import User from '../db/models/User.js'
import {
  createShipmentItem,
  validateIfUserWantSending
} from '../graphql/utils/sendings.js'
import MiPaqueteController from './mipaquete-controller.js'

const MercadoPago = {}

const webhookController = async (req, res) => {
  try {
    const { body, query } = req
    const topic = query.topic || query.type
    if (topic === WEBHOOK_TYPE.PAYMENT) {
      const {
        data: { id },
        type
      } = body
      switch (type) {
        case WEBHOOK_TYPE.PAYMENT: {
          const payment = await mercadopago.payment.findById(id)
          if (!payment) throw new ApolloError('Payment not found')
          const {
            id: paymentId,
            order,
            status,
            status_detail: statusDetail,
            payer,
            metadata: { store_order_id: storeOrderId }
          } = payment.body

          const isPaidSuccessfully =
            status === PAYMENT.approved && statusDetail === PAYMENT.accredited

          const updatedFields = {
            isPaid: isPaidSuccessfully,
            paidAt: isPaidSuccessfully ? Date.now() : null,
            paymentResult: {
              id: paymentId,
              order,
              status,
              result: statusDetail,
              payer: {
                firstName: payer?.first_name || '',
                lastName: payer?.last_name || '',
                email: payer?.email || '',
                phone: `+${
                  payer?.phone?.area_code
                    ? payer?.phone?.area_code
                    : 'No area code'
                } ${
                  payer?.phone?.number
                    ? payer?.phone?.number
                    : 'No phone number'
                }`,
                identification: payer?.identification || {}
              }
            }
          }

          const currentOrder = await Order.findOneAndUpdate(
            { _id: storeOrderId, isPaid: false },
            updatedFields,
            { new: true }
          )

          if (currentOrder && currentOrder.isPaid) {
            const existOneShipment = await Shipment.findOne({
              order: currentOrder._id
            })
            if (!existOneShipment) {
              const currentUser = await User.findById(currentOrder.user)
              if (validateIfUserWantSending(currentOrder)) {
                const shipment = createShipmentItem(currentOrder, currentUser)
                const newShipping = new Shipment({
                  ...shipment
                })
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

          break
        }

        case WEBHOOK_TYPE.PLAN: {
          const plan = await mercadopago.preapproval.findById(id)
          console.log('Plan: ', plan)
          break
        }

        case WEBHOOK_TYPE.SUBSCRIPTION: {
          const subscription = await mercadopago.preapproval.findById(id)
          const { preapproval_plan_id: planId } = subscription
          console.log('Subscription: ', subscription)
          console.log('Plan Id: ', planId)
          break
        }

        case WEBHOOK_TYPE.INVOICE: {
          console.log('Invoice data: ', body)
          break
        }

        case WEBHOOK_TYPE.POINT_INTEGRATION_WH: {
          console.log('Point integration Wh: ', body)
          break
        }

        default: {
          break
        }
      }
    }
    res.status(200).send('Notification received')
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal server error')
  }
}

MercadoPago.webhookController = webhookController

export default MercadoPago
