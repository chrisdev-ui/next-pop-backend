import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import currencyConverter from '../services/currencyConverter.js'
import generateAccessToken from '../services/paypal.js'

const { PAYPAL_API } = process.env

async function createOrder({
  orderItems,
  shipmentCost = 0,
  fromCurrencyCode,
  orderId,
  currencyCode
}) {
  const accessToken = await generateAccessToken()
  const items = await Promise.all(
    orderItems.map(async ({ slug, name, price, quantity }) => {
      const unitAmount = await currencyConverter({
        amount: price,
        fromCurrency: fromCurrencyCode,
        toCurrency: currencyCode
      })

      return {
        name: String(name),
        description: `Es un/una ${name} de tipo ${slug}`,
        quantity: String(quantity),
        category: 'PHYSICAL_GOODS',
        unit_amount: {
          currency_code: currencyCode,
          value: String(unitAmount.toFixed(2))
        }
      }
    })
  )
  const itemTotalInUsd = items?.reduce(
    (itemTotal, item) =>
      itemTotal + Number(item?.quantity) * Number(item?.unit_amount?.value),
    0
  )
  const shippingCostInUsd =
    shipmentCost !== 0
      ? await currencyConverter({
          amount: shipmentCost,
          fromCurrency: fromCurrencyCode,
          toCurrency: currencyCode
        })
      : shipmentCost
  try {
    const url = `${PAYPAL_API}/v2/checkout/orders`
    const order = {
      intent: 'CAPTURE',
      payment_source: {
        paypal: {
          experience_context: {
            return_url: `${process.env.CLIENT_ORIGIN}/order/${orderId}`,
            cancel_url: `${process.env.CLIENT_ORIGIN}/order/${orderId}`,
            brand_name: process.env.BRAND_NAME
          }
        }
      },
      purchase_units: [
        {
          custom_id: orderId.toString(),
          items,
          amount: {
            currency_code: currencyCode,
            value: String((itemTotalInUsd + shippingCostInUsd).toFixed(2)),
            breakdown: {
              item_total: {
                currency_code: currencyCode,
                value: String(itemTotalInUsd.toFixed(2))
              },
              shipping: {
                currency_code: currencyCode,
                value: String(shippingCostInUsd.toFixed(2))
              }
            }
          }
        }
      ]
    }
    const { data } = await axios.post(url, order, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'PayPal-Request-Id': uuidv4()
      }
    })
    return data
  } catch (error) {
    console.error('Error creating a new order', error)
    throw new Error(error.message)
  }
}

export default createOrder
