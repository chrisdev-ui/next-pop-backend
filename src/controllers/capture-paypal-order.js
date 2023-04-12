import axios from 'axios'
import generateAccessToken from '../services/paypal.js'

const { PAYPAL_API } = process.env

async function capturePayment(orderId) {
  const accessToken = await generateAccessToken()

  try {
    const url = `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`
    const response = await axios({
      method: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error creating a new order', error)
    throw new Error(error.message)
  }
}

export default capturePayment
