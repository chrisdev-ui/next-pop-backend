import { ApolloError } from 'apollo-server-core'
import axios from 'axios'

const {
  BANCOLOMBIA_CLIENT_ID,
  BANCOLOMBIA_CLIENT_SECRET,
  BANCOLOMBIA_SANDBOX_API
} = process.env

const BancolombiaService = {}

async function generateAccessToken() {
  const auth = Buffer.from(
    `${BANCOLOMBIA_CLIENT_ID}:${BANCOLOMBIA_CLIENT_SECRET}`
  ).toString('base64')
  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')
  params.append(
    'scope',
    'Transfer-Intention:write:app Transfer-Intention:read:app'
  )
  const url = `${BANCOLOMBIA_SANDBOX_API}/public-partner/sb/security/oauth-provider/oauth2/token`
  try {
    const {
      data: {
        token_type: tokeType,
        access_token: accessToken,
        expires_in: expiresIn
      }
    } = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Basic ${auth}`
      }
    })
    return {
      authString: `${tokeType} ${accessToken}`,
      expirationTime: new Date().getTime() + expiresIn * 1000
    }
  } catch (error) {
    console.error('Error generating access token:', error)
    throw new ApolloError('Failed to generate access token.')
  }
}

BancolombiaService.generateAccessToken = generateAccessToken

export default BancolombiaService
