import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const MiPaqueteController = {}

const sessionTracker = uuidv4()

const { MIPAQUETE_API_KEY, MIPAQUETE_API, NGROK_URL } = process.env

const getHeaders = () => ({
  'session-tracker': sessionTracker,
  apikey: MIPAQUETE_API_KEY
})

const getUrl = (endpoint) => `${MIPAQUETE_API}/${endpoint}`

const isObject = (obj) =>
  Object.prototype.toString.call(obj) === '[object Object]'

const handleError = (error) => {
  const {
    data: {
      message: { code, title, detail },
      status,
      path
    }
  } = error.response

  const titleText = title ? `${title}: ` : ''
  const detailText = detail ? `${detail}` : ''
  const pathText = path ? ` in ${path}` : ''

  const statusCode = status || code || 500

  const errorMessage = `${titleText}${detailText}${pathText}`
  const newError = new Error(errorMessage)
  newError.statusCode = statusCode

  return newError
}

const validateRequiredFields = (input, key) => {
  const missingFields = []
  if (!requiredFields.hasOwnProperty(key)) return missingFields
  const fields = requiredFields[key]

  for (const field of fields) {
    if (!input.hasOwnProperty(field)) {
      missingFields.push(field)
    }
  }

  return missingFields
}

const requiredFields = {
  quoteShipping: [
    'originLocationCode',
    'destinyLocationCode',
    'height',
    'width',
    'length',
    'weight',
    'quantity',
    'declaredValue'
  ],
  createSending: [
    'sender',
    'receiver',
    'productInformation',
    'locate',
    'channel',
    'deliveryCompany',
    'paymentType',
    'valueCollection',
    'requestPickup',
    'adminTransactionData'
  ],
  getSendings: ['pageSize'],
  myDirectionsPost: ['locationCode', 'name', 'address'],
  myDirectionsPut: ['locationCode', 'name', 'address', '_id']
}

MiPaqueteController.getLocations = async (locationCode) => {
  const url = getUrl('getLocations')
  const headers = getHeaders()
  let params = {}
  if (locationCode) params = { locationCode }
  try {
    const { data } = await axios.get(url, { headers, params })
    return { data }
  } catch (error) {
    return { error: handleError(error) }
  }
}

MiPaqueteController.quoteShipping = async (inputQuote) => {
  const missingFields = validateRequiredFields(inputQuote, 'quoteShipping')
  if (missingFields.length > 0)
    return {
      error: new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }
  const url = getUrl('quoteShipping')
  const headers = getHeaders()
  try {
    const { data } = await axios.post(url, inputQuote, { headers })
    return { data }
  } catch (error) {
    return { error: handleError(error) }
  }
}

MiPaqueteController.createSending = async (inputSending) => {
  const missingFields = validateRequiredFields(inputSending, 'createSending')
  if (missingFields.length > 0)
    return {
      error: new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }
  const url = getUrl('createSending')
  const headers = getHeaders()
  try {
    const { data } = await axios.post(url, inputSending, { headers })
    return { data }
  } catch (error) {
    return { error: handleError(error) }
  }
}

MiPaqueteController.getSendings = async (inputGetSendings) => {
  const missingFields = validateRequiredFields(inputGetSendings, 'getSendings')
  if (missingFields.length > 0)
    return {
      error: new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }
  const url = getUrl('getSendings/1')
  const headers = getHeaders()
  try {
    const { data } = await axios.post(url, inputGetSendings, { headers })
    return { data }
  } catch (error) {
    return { error: handleError(error) }
  }
}

MiPaqueteController.getSendingTracking = async (mpCode) => {
  if (!mpCode) return { error: new Error('Missing MP code field') }
  const url = getUrl('getSendingTracking')
  const headers = getHeaders()
  const params = { mpCode }
  try {
    const { data } = await axios.get(url, { headers, params })
    return { data }
  } catch (error) {
    return { error: handleError(error) }
  }
}

MiPaqueteController.getDeliveryCompanies = async () => {
  const url = getUrl('getDeliveryCompanies')
  const headers = getHeaders()
  try {
    const { data } = await axios.get(url, { headers })
    return { data }
  } catch (error) {
    return { error: handleError(error) }
  }
}

MiPaqueteController.cancelSending = async (mpCode) => {
  if (!mpCode) return { error: new Error('Missing MP code field') }
  const url = getUrl('cancelSending')
  const headers = getHeaders()
  const cancelData = { mpCode }
  try {
    const { data } = await axios.put(url, cancelData, { headers })
    return { data }
  } catch (error) {
    return { error: handleError(error) }
  }
}

MiPaqueteController.getMyDirections = async () => {
  const url = getUrl('myDirections')
  const headers = getHeaders()
  try {
    const { data } = await axios.get(url, { headers })
    return { data }
  } catch (error) {
    return { error: handleError(error) }
  }
}

MiPaqueteController.createMyDirections = async (myDirections = []) => {
  if (!isObject(myDirections) && !Array.isArray(myDirections))
    return { error: new Error('Invalid directions') }
  const url = getUrl('myDirections')
  const headers = getHeaders()
  let directionsData = []
  if (Array.isArray(myDirections)) directionsData = myDirections
  else {
    const missingFields = validateRequiredFields(
      myDirections,
      'myDirectionsPost'
    )
    if (missingFields.length > 0)
      return {
        error: new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }
    directionsData.push(myDirections)
  }
  try {
    const { data } = await axios.post(url, directionsData, { headers })
    return { data }
  } catch (error) {
    return { error: handleError(error) }
  }
}

MiPaqueteController.updateMyDirections = async (myDirections = []) => {
  if (!isObject(myDirections) && !Array.isArray(myDirections))
    return { error: new Error('Invalid directions') }
  const url = getUrl('myDirections')
  const headers = getHeaders()
  let directionsData = []
  if (Array.isArray(myDirections)) directionsData = myDirections
  else {
    const missingFields = validateRequiredFields(
      myDirections,
      'myDirectionsPut'
    )
    if (missingFields.length > 0)
      return {
        error: new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }
    directionsData.push(myDirections)
  }
  try {
    const { data } = await axios.put(url, directionsData, { headers })
    return { data }
  } catch (error) {
    return { error: handleError(error) }
  }
}

MiPaqueteController.deleteMyDirections = async (directionIds = []) => {
  let directionsData = []
  if (!Array.isArray(directionIds) && typeof directionIds !== 'string')
    return { error: new Error('Invalid direction ids') }
  if (typeof directionIds === 'string') {
    directionsData.push(directionIds)
  } else {
    if (!directionIds.every((val) => typeof val === 'string'))
      return { error: new Error('Direction IDs must be strings') }
    directionsData = directionIds
  }
  const url = getUrl('myDirections')
  const headers = getHeaders()
  try {
    const { data } = await axios.delete(url, { headers, data: directionIds })
    return { data }
  } catch (error) {
    console.error(error)
    return { error: handleError(error) }
  }
}

MiPaqueteController.createWebHook = async (urlGuides = '', urlStates = '') => {
  const url = getUrl('createWebHook')
  const headers = getHeaders()
  const webhooks = {
    urlForGuides: {
      urlClient: urlGuides || `${NGROK_URL}/webhooks/mipaquete-guides`,
      enabled: true
    },
    urlForStates: {
      urlClient: urlStates || `${NGROK_URL}/webhooks/mipaquete-states`,
      enabled: true
    }
  }
  try {
    const { data } = await axios.post(url, webhooks, { headers })
    return { data }
  } catch (error) {
    return { error: handleError(error) }
  }
}

MiPaqueteController.updateAndDisableWebhook = async (
  { urlForGuides, enabledGuides },
  { urlForStates, enabledStates }
) => {
  const url = getUrl('updateAndDisableWebhook')
  const headers = getHeaders()
  const urlForGuidesObj = {}
  const urlForStatesObj = {}
  if (urlForGuides) urlForGuidesObj.urlClient = urlForGuides
  if (enabledGuides) urlForGuidesObj.enabled = enabledGuides
  if (urlForStates) urlForStatesObj.urlClient = urlForStates
  if (enabledStates) urlForStatesObj.enabled = enabledStates

  const requestData = {
    ...urlForGuidesObj,
    ...urlForStatesObj
  }

  try {
    const { data } = await axios.put(url, requestData, { headers })
    return { data }
  } catch (error) {
    return { error: handleError(error) }
  }
}

MiPaqueteController.statesWebhookController = async (req, res) => {
  try {
    console.log('Request Body:', req.body)
    res.status(200).send('Notification received!')
  } catch (error) {
    console.error(error)
    res.status(500).send(`Error in webhook: ${error.message}`)
  }
}

MiPaqueteController.guidesWebhookController = async (req, res) => {
  try {
    console.log('Request Body:', req.body)
    res.status(200).send('Notification received!')
  } catch (error) {
    console.error(error)
    res.status(500).send(`Error in webhook: ${error.message}`)
  }
}

export default MiPaqueteController
