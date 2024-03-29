import {
  ApolloError,
  AuthenticationError,
  ForbiddenError
} from 'apollo-server-core'
import { GraphQLError } from 'graphql'
import { BANCOLOMBIA_TRANSFER_STATES, PAYMENT_METHOD } from '../../config.js'
import BancolombiaController from '../../controllers/bancolombia-controller.js'
import capturePayment from '../../controllers/capture-paypal-order.js'
import createOrder from '../../controllers/create-paypal-order.js'
import MiPaqueteController from '../../controllers/mipaquete-controller.js'
import Order from '../../db/models/Order.js'
import Shipment from '../../db/models/Shipment.js'
import User from '../../db/models/User.js'
import generateOrderNumber from '../utils/generate-order-number.js'
import {
  createShipmentItem,
  validateIfUserWantSending
} from '../utils/sendings.js'

const resolvers = {
  Query: {
    getOrderById: async (_, { id }, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      try {
        const order = await Order.findById(id)
        if (
          order?.user.toString() !== session?.user._id &&
          !session?.user.isAdmin
        )
          throw new ForbiddenError(
            'You are not authorized to perform this action.'
          )
        return order
      } catch (error) {
        throw new GraphQLError(`${error.message}`, {
          extensions: { code: 'ERROR_CONNECTING_TO_DATABASE' }
        })
      }
    },
    paypalClientId: (_, __, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      const { PAYPAL_CLIENT_ID } = process.env
      return PAYPAL_CLIENT_ID || 'sb'
    },
    validateBancolombiaTransfer: async (_, { transferCode }, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in')
      const { response, error } =
        await BancolombiaController.validateTransferCode({ transferCode })
      if (error)
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BANCOLOMBIA_SERVER_ERROR',
            http: { status: error.statusCode }
          }
        })
      return response
    },
    getOrdersHistory: async (_, __, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in')
      const {
        user: { _id: userId, isAdmin }
      } = session || {}
      const user = {}
      if (!isAdmin) user.user = userId
      try {
        const orders = await Order.find(user)
        return orders
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'ERROR_CONNECTING_TO_DATABASE' },
          http: { status: 500 }
        })
      }
    }
  },
  Mutation: {
    createOrder: async (_, args, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in')
      try {
        return await Order.create({
          user: session?.user._id,
          orderNumber: generateOrderNumber(),
          ...args
        })
      } catch (error) {
        throw new GraphQLError('Error while creating order in database', {
          extensions: { code: 'ERROR_CONNECTING_TO_DATABASE' }
        })
      }
    },
    newPreference: async (_, { storeOrderId }, { session, mercadopago }) => {
      if (!session) throw new AuthenticationError('User not logged in')
      const currentOrder = await Order.findById(storeOrderId)
      if (!currentOrder) throw new ApolloError('Order not found', 'NOT_FOUND')
      if (currentOrder.paymentMethod !== PAYMENT_METHOD.MERCADOPAGO)
        throw new ApolloError(
          'The payment method of the order is different from the current operation',
          'PAYMENT_METHOD_MISMATCH'
        )
      if (currentOrder.isPaid)
        throw new ApolloError(
          'The order has already been paid',
          'ORDER_ALREADY_PAID'
        )
      const shouldAddShipmentToPreference =
        currentOrder.shippingInfo?.deliveryCompany &&
        !currentOrder.shippingInfo?.isCashOnDelivery
      const preference = {
        metadata: { store_order_id: currentOrder._id },
        items: currentOrder.orderItems.map(
          ({ slug, name, image, price, quantity }) => ({
            id: slug,
            title: name,
            currency_id: 'COP',
            picture_url: image,
            description: `Es un/una ${name} de tipo ${slug}`,
            category_id: 'art',
            unit_price: price,
            quantity: quantity
          })
        ),
        back_urls: {
          success: `${process.env.CLIENT_ORIGIN}/order/${currentOrder._id}`,
          failure: `${process.env.CLIENT_ORIGIN}/order/${currentOrder._id}`,
          pending: `${process.env.CLIENT_ORIGIN}/order/${currentOrder._id}`
        },
        auto_return: 'approved',
        ...(shouldAddShipmentToPreference && {
          shipments: {
            mode: 'not_specified',
            cost: currentOrder.shippingPrice
          }
        }),
        notification_url: `${process.env.NGROK_URL}/webhooks/mercadopago`
      }
      try {
        const response = await mercadopago.preferences.create(preference)
        return {
          preferenceId: response.body.id,
          initPointUrl: response.body.init_point
        }
      } catch (error) {
        throw new GraphQLError('Could not create preference', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      }
    },
    createPayPalOrder: async (
      _,
      { orderData: { currencyCode, fromCurrencyCode, orderId } },
      { session }
    ) => {
      if (!session) throw new AuthenticationError('User not logged in')
      const currentOrder = await Order.findById(orderId)
      if (!currentOrder) throw new ApolloError('Order not found', 'NOT_FOUND')
      if (currentOrder.paymentMethod !== PAYMENT_METHOD.PAYPAL)
        throw new ApolloError(
          'The payment method of the order is different from the current operation',
          'PAYMENT_METHOD_MISMATCH'
        )
      if (currentOrder.isPaid)
        throw new ApolloError(
          'The order has already been paid',
          'ORDER_ALREADY_PAID'
        )
      const shouldAddShipmentToOrder =
        currentOrder.shippingInfo?.deliveryCompany &&
        !currentOrder.shippingInfo?.isCashOnDelivery
      try {
        return await createOrder({
          orderId: currentOrder._id,
          orderItems: currentOrder.orderItems,
          ...(shouldAddShipmentToOrder && {
            shipmentCost: currentOrder.shippingPrice
          }),
          fromCurrencyCode,
          currencyCode
        })
      } catch (error) {
        throw new GraphQLError(
          `Could not create an order in Paypal: ${error.message}`,
          {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          }
        )
      }
    },
    capturePayPalPayment: async (
      _,
      { paymentData: { paypalOrderId, orderId } },
      { session }
    ) => {
      try {
        if (!session) throw new AuthenticationError('User not logged in')
        const paypalPayment = await capturePayment(paypalOrderId)
        if (!paypalPayment)
          throw new GraphQLError('Paypal payment not found', {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          })
        const { id, status, payer } = paypalPayment
        const isPaymentCompleted =
          status === 'COMPLETED' || status === 'APPROVED'
        const updatedFields = {
          isPaid: isPaymentCompleted,
          paidAt: isPaymentCompleted ? Date.now() : null,
          paymentResult: {
            id,
            order: {},
            status,
            result: isPaymentCompleted ? 'accredited' : 'pending',
            payer: {
              firstName: payer?.name.given_name || '',
              lastName: payer?.name.surname || '',
              email: payer?.email_address || '',
              phone: 'Paypal does not support phone numbers',
              identification: {
                number: `Paypal Payer ID: ${payer.payer_id}`
              }
            }
          }
        }
        const paidOrder = await Order.findOneAndUpdate(
          {
            _id: orderId,
            isPaid: false
          },
          updatedFields,
          { new: true }
        )
        if (!paidOrder)
          throw new GraphQLError('Order is already paid or does not exist', {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          })
        if (paidOrder.isPaid) {
          const currentUser = await User.findById(currentOrder.user)
          if (validateIfUserWantSending(paidOrder)) {
            const shipment = createShipmentItem(paidOrder, currentUser)
            const newShipping = new Shipment({ ...shipment })
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
            const { data, error } = await MiPaqueteController.createSending(
              sendingInput
            )
            if (error) {
              newShipping.status = error.message
              await newShipping.save()
            } else {
              const { mpCode, message } = data
              newShipping.trackingNumber = mpCode
              newShipping.status = message
              await newShipping.save()
            }
          }
        }
        return paidOrder
      } catch (error) {
        throw new GraphQLError(
          `Could not capture order. Cause: ${error.message}`,
          {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          }
        )
      }
    },
    createBancolombiaTransfer: async (
      _,
      {
        orderData: {
          commerceTransferButtonId,
          transferReference,
          transferDescription
        }
      },
      { session, cache }
    ) => {
      if (!session) throw new AuthenticationError('User not logged in')
      const currentOrder = await Order.findById(transferReference)
      if (!currentOrder) throw new ApolloError('Order not found', 'NOT_FOUND')
      if (currentOrder.paymentMethod !== PAYMENT_METHOD.BOTON_BANCOLOMBIA)
        throw new ApolloError(
          'The payment method of the order is different from the current operation',
          'PAYMENT_METHOD_MISMATCH'
        )
      if (currentOrder.isPaid)
        throw new ApolloError(
          'The order has already been paid',
          'ORDER_ALREADY_PAID'
        )
      if (cache.has(transferReference)) {
        const cachedResponse = cache.get(transferReference)
        const { transferCode } = cachedResponse.data[0]
        const { response } = await BancolombiaController.validateTransferCode({
          transferCode
        })
        if (
          response?.data[0]?.transferState !==
          BANCOLOMBIA_TRANSFER_STATES.rejected
        ) {
          return cachedResponse
        } else {
          cache.delete(transferReference)
        }
      }
      const { HASH_BANCOLOMBIA_BUTTON, BRAND_NAME } = process.env
      const shouldAddShipmentToTransfer =
        currentOrder.shippingInfo?.deliveryCompany &&
        !currentOrder.shippingInfo?.isCashOnDelivery
      const { response, error } = await BancolombiaController.transferRegistry({
        commerceTransferButtonId:
          commerceTransferButtonId || HASH_BANCOLOMBIA_BUTTON,
        transferReference: String(currentOrder._id),
        transferAmount: shouldAddShipmentToTransfer
          ? currentOrder.totalPrice
          : currentOrder.itemsPrice,
        transferDescription:
          transferDescription ||
          `Compra realizada en ${BRAND_NAME} para la adquisición de productos Kawaii!`
      })
      if (error)
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BANCOLOMBIA_SERVER_ERROR',
            http: { status: error.statusCode }
          }
        })
      cache.set(transferReference, response)
      return response
    }
  }
}

export default resolvers
