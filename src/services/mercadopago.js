import * as dotenv from 'dotenv'
import mercadopago from 'mercadopago'

dotenv.config() // enable all environment variables

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
})

export default mercadopago
