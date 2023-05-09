import {
  AuthenticationError,
  ForbiddenError,
  UserInputError
} from 'apollo-server-core'
import { GraphQLError } from 'graphql'
import { GET_SENDINGS_MP } from '../../config.js'
import MiPaqueteController from '../../controllers/mipaquete-controller.js'
import Order from '../../db/models/Order.js'
import Shipment from '../../db/models/Shipment.js'

const {
  getLocations,
  quoteShipping,
  createSending,
  getSendings,
  getSendingTracking,
  getDeliveryCompanies,
  cancelSending,
  getMyDirections,
  createMyDirections,
  updateMyDirections,
  deleteMyDirections
} = MiPaqueteController

const resolvers = {
  Query: {
    getLocations: async (_, { locationCode }, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      const { data, error } = await getLocations(locationCode)
      if (error)
        throw new GraphQLError(error.message, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      return data
    },
    getSendings: async (_, { input = {} }, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      const {
        shipmentId = null,
        pageSize,
        deliveryCompany,
        mpCode,
        confirmationDate: { init, end } = {}
      } = input
      const getSendingsInput = {
        pageSize: pageSize || GET_SENDINGS_MP.pageSizeDefault,
        ...(deliveryCompany &&
          deliveryCompany.lenght > 0 && { deliveryCompany }),
        ...(init && end && { confirmationDate: { init, end } }),
        ...(mpCode && { mpCode })
      }
      if (!shipmentId) {
        if (!session.user.isAdmin)
          throw new ForbiddenError(
            'You must be an administrator to perform this action.'
          )
        const { data, error } = await getSendings(getSendingsInput)
        if (error) throw new GraphQLError(error.message)
        return data
      }
      const shipment = await Shipment.findById(shipmentId)
      if (!shipment) throw new UserInputError('Shipment not found')
      const order = await Order.findById(shipment?.order)
      if (!order) throw new UserInputError('Order not found')
      if (
        order?.user.toString() !== session?.user._id &&
        !session?.user.isAdmin
      )
        throw new ForbiddenError(
          'You are not authorized to perform this action.'
        )
      getSendingsInput.mpCode = shipment?.trackingNumber
      const { data, error } = await getSendings(getSendingsInput)
      if (error) throw new GraphQLError(error.message)
      return data
    },
    getSendingTracking: async (_, { mpCode }, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      const shipment = await Shipment.findOne({ trackingNumber: mpCode })
      if (!shipment) throw new UserInputError('Shipment not found')
      const order = await Order.findById(shipment?.order)
      if (!order) throw new UserInputError('Order not found')
      if (
        order?.user.toString() !== session?.user._id &&
        !session?.user.isAdmin
      )
        throw new ForbiddenError(
          'You are not authorized to perform this action.'
        )
      const { data, error } = await getSendingTracking(mpCode)
      if (error) throw new GraphQLError(error.message)
      return data
    },
    deliveryCompanies: async (_, __, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      const { data, error } = await getDeliveryCompanies()
      if (error) throw new GraphQLError(error.message)
      return data
    },
    getMpDirections: async (_, __, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      if (!session?.user.isAdmin)
        throw new ForbiddenError(
          'You must be an administrator to access this information.'
        )
      const { data, error } = await getMyDirections()
      if (error)
        throw new GraphQLError(error.message, {
          extensions: { code: error.statusCode }
        })
      return data
    }
  },
  Mutation: {
    quoteShipping: async (_, { input }, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      try {
        const { data, error } = await quoteShipping(input)
        if (error) throw new GraphQLError(error.message)
        return data
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      }
    },
    createShipping: async (_, { input }, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      try {
        const newShipping = new Shipment({
          ...input
        })

        const sendingInput = {
          sender: newShipping.sender,
          receiver: newShipping.receiver,
          productInformation: newShipping.productInformation,
          locate: newShipping.locate,
          channel: newShipping.channel,
          ...(newShipping.user && { user: newShipping.user }),
          deliveryCompany: newShipping.deliveryCompany,
          ...(newShipping.description && {
            description: newShipping.description
          }),
          ...(newShipping.comments && { comments: newShipping.comments }),
          paymentType: newShipping.paymentType,
          valueCollection: newShipping.valueCollection,
          requestPickup: newShipping.requestPickup,
          adminTransactionData: newShipping.adminTransactionData
        }
        const { data, error } = await createSending(sendingInput)
        if (error) throw new GraphQLError(error.message)
        const { mpCode, message } = data
        newShipping.trackingNumber = mpCode
        newShipping.status = message

        await newShipping.save()
        return newShipping
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      }
    },
    cancelSending: async (_, { mpCode }, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      const shipment = await Shipment.findOne({ trackingNumber: mpCode })
      if (!shipment) throw new UserInputError('Shipment not found')
      const order = await Order.findById(shipment?.order)
      if (!order) throw new UserInputError('Order not found')
      if (
        order?.user.toString() !== session?.user._id &&
        !session?.user.isAdmin
      )
        throw new ForbiddenError(
          'You are not authorized to perform this action.'
        )
      const { data, error } = await cancelSending(mpCode)
      if (error) throw new GraphQLError(error.message)
      return data
    },
    createMpDirections: async (_, { input }, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      if (!session?.user.isAdmin)
        throw new ForbiddenError(
          'You must be an administrator to access this information.'
        )
      const { data, error } = await createMyDirections(input)
      if (error)
        throw new GraphQLError(error.message, {
          extensions: { code: error.statusCode }
        })
      return data
    },
    updateMpDirections: async (_, { input }, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      if (!session?.user.isAdmin)
        throw new ForbiddenError(
          'You must be an administrator to access this information.'
        )
      const { data, error } = await updateMyDirections(input)
      if (error)
        throw new GraphQLError(error.message, {
          extensions: { code: error.statusCode }
        })
      return data
    },
    deleteMpDirections: async (_, { myDirections }, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      if (!session?.user.isAdmin)
        throw new ForbiddenError(
          'You must be an administrator to access this information.'
        )
      const { data, error } = await deleteMyDirections(myDirections)
      if (error)
        throw new GraphQLError(error.message, {
          extensions: { code: error.statusCode }
        })
      return Array.isArray(data) && data.length === 0
    }
  }
}

export default resolvers
