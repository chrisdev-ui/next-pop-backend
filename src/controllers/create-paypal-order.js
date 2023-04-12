import axios from 'axios'
import generateAccessToken from '../services/paypal.js'
// import currencyConverter from '../services/currencyConverter.js'

const { PAYPAL_API } = process.env

async function createOrder({ totalAmount, currencyCode }) {
  const accessToken = await generateAccessToken()
  //   const amount = await currencyConverter({
  //     amount: totalAmount || '20000',
  //     fromCurrency: 'COP',
  //     toCurrency: 'USD'
  //   })
  if (!totalAmount || !currencyCode) throw new Error('Missing arguments')
  try {
    const url = `${PAYPAL_API}/v2/checkout/orders`
    const order = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currencyCode,
            value: totalAmount.toString()
          }
        }
      ]
    }
    const { data } = await axios.post(url, order, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    return data
  } catch (error) {
    console.error('Error creating a new order', error)
    throw new Error(error.message)
  }
}

export default createOrder
