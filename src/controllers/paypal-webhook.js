import { PAYPAL_WEBHOOK_TYPE } from '../config.js'
import Order from '../db/models/Order.js'

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
          }
        })
        break
      }

      default: {
        break
      }
    }
  } catch (error) {
    res.status(error.status).send('Error: ' + error.message)
  }
}

Paypal.webhookController = webhookController

export default Paypal
