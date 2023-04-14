import { ApolloError } from 'apollo-server-core'
import mercadopago from 'mercadopago'
import { PAYMENT, WEBHOOK_TYPE } from '../config.js'
import Order from '../db/models/Order.js'

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

          await Order.updateOne(
            { _id: storeOrderId, isPaid: false },
            { $set: updatedFields }
          )

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
