import { BANCOLOMBIA_TRANSFER_STATES } from '../config.js'
import Order from '../db/models/Order.js'

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
    await Order.updateOne(
      { _id: transferReference, isPaid: false },
      { $set: updatedFields }
    )
    res.status(200).send('Notification Received!')
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
}

export default Bancolombia
