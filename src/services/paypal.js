import { ApolloError } from 'apollo-server-core'
import axios from 'axios'

const { PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_API } = process.env

async function generateAccessToken() {
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ':' + PAYPAL_SECRET).toString(
    'base64'
  )
  try {
    const params = new URLSearchParams()
    params.append('grant_type', 'client_credentials')
    const {
      data: { access_token }
    } = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`
      }
    })
    return access_token
  } catch (error) {
    console.error('Error generating access token:', error)
    throw new ApolloError('Failed to generate access token.')
  }
}

export default generateAccessToken
