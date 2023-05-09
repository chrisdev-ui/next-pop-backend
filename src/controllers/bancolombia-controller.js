import axios from 'axios'
import BancolombiaService from '../services/bancolombia.js'

const BancolombiaController = {}

const { BANCOLOMBIA_SANDBOX_API, CLIENT_ORIGIN, NGROK_URL } = process.env

let authorizationString = ''
let expirationTime = 0

const isTokenValid = () => {
  const currentTime = new Date().getTime()
  return currentTime < expirationTime
}

const refreshAccessToken = async () => {
  const tokenInfo = await BancolombiaService.generateAccessToken()
  authorizationString = tokenInfo.authString
  expirationTime = tokenInfo.expirationTime
}

const getHeaders = async () => {
  if (!isTokenValid()) {
    await refreshAccessToken()
  }
  return {
    'Content-Type': 'application/vnd.bancolombia.v1+json',
    Accept: 'application/vnd.bancolombia.v1+json',
    Authorization: authorizationString
  }
}

const getUrl = (endpoint) => `${BANCOLOMBIA_SANDBOX_API}${endpoint}`

const handleError = (error) => {
  const {
    data: { errors }
  } = error.response
  const { title, code, status, detail } = errors[0]
  const errorMessage = detail
  const statusCode = status
  const newError = new Error(errorMessage)
  newError.statusCode = statusCode
  newError.title = title
  newError.code = code
  return newError
}

BancolombiaController.transferRegistry = async ({
  commerceTransferButtonId,
  transferReference,
  transferAmount,
  transferDescription
}) => {
  try {
    const url = getUrl(
      '/public-partner/sb/v3/operations/cross-product/payments/payment-order/transfer/action/registry'
    )
    const headers = await getHeaders()
    const requestBody = {
      data: [
        {
          commerceTransferButtonId,
          transferReference,
          transferAmount,
          commerceUrl: `${CLIENT_ORIGIN}/order/${transferReference}`,
          transferDescription,
          confirmationURL: `${NGROK_URL}/webhooks/bancolombia`
        }
      ]
    }
    const { data: response } = await axios.post(url, requestBody, { headers })
    return { response }
  } catch (error) {
    console.error(error)
    return { error: handleError(error) }
  }
}

BancolombiaController.validateTransferCode = async ({ transferCode }) => {
  try {
    const url = getUrl(
      `/public-partner/sb/v3/operations/cross-product/payments/payment-order/transfer/${transferCode}/action/validate`
    )
    const headers = await getHeaders()
    const { data: response } = await axios.get(url, { headers })
    return { response }
  } catch (error) {
    console.error(error)
    return { error: handleError(error) }
  }
}

export default BancolombiaController
