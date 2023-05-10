import { BANCOLOMBIA_TRANSFER_STATES } from '../config.js'
import Order from '../db/models/Order.js'
import Shipment from '../db/models/Shipment.js'
import User from '../db/models/User.js'
import {
  createShipmentItem,
  validateIfUserWantSending
} from '../graphql/utils/sendings.js'
import MiPaqueteController from './mipaquete-controller.js'

const Bancolombia = {}

Bancolombia.webhookController = async (req, res) => {
  try {
    const {
      transferVoucher,
      transferStateDescription,
      transferState,
      transferDate,
      transferCode,
      transferReference
    } = req?.body
    const { approved } = BANCOLOMBIA_TRANSFER_STATES
    const isPaidSuccessfully = transferState === approved
    const updatedFields = {
      isPaid: isPaidSuccessfully,
      paidAt: isPaidSuccessfully
        ? transferDate
          ? new Date(transferDate)
          : Date.now()
        : null,
      paymentResult: {
        id: transferCode,
        order: {
          type: 'transferVoucher',
          id: transferVoucher
        },
        status: transferState,
        result: transferStateDescription || null
      }
    }
    const currentOrder = await Order.findOneAndUpdate(
      {
        _id: transferReference,
        isPaid: false
      },
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
            ...(newShipping.comments && { comments: newShipping.comments }),
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
    res.status(200).send('Notification Received!')
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
}

export default Bancolombia
