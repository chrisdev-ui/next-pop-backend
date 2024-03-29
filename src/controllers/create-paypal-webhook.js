import axios from 'axios'
import generateAccessToken from '../services/paypal.js'

const { PAYPAL_API, NGROK_URL } = process.env

const webhookUrl = `${NGROK_URL}/webhooks/paypal`

async function createPayPalWebhook() {
  // Get an access token from PayPal
  const accessToken = await generateAccessToken()
  // Url for Paypal create webhook
  const url = `${PAYPAL_API}/v1/notifications/webhooks`
  // Create the webhook
  const webhookData = {
    url: webhookUrl,
    event_types: [
      {
        name: 'CHECKOUT.ORDER.COMPLETED'
      },
      {
        name: 'CHECKOUT.ORDER.APPROVED'
      }
    ]
  }

  try {
    const { data: webhook } = await axios.post(url, webhookData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })

    return webhook
  } catch (error) {
    throw new Error(error.message)
  }
}

export default createPayPalWebhook
