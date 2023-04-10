import {
  ApolloError,
  AuthenticationError,
  ForbiddenError
} from 'apollo-server-core'
import { GraphQLError } from 'graphql'
import { PAYMENT_METHOD } from '../../config.js'
import Order from '../../db/models/Order.js'
import generateOrderNumber from '../utils/generate-order-number.js'

const resolvers = {
  Query: {
    getOrderById: async (_, { id }, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in.')
      const order = await Order.findById(id)
      if (order?.user != session?.user._id && !session?.user.isAdmin)
        throw new ForbiddenError(
          'You are not authorized to perform this action.'
        )
      return order
    }
  },
  Mutation: {
    createOrder: async (_, args, { session }) => {
      if (!session) throw new AuthenticationError('User not logged in')
      return await Order.create({
        user: session?.user._id,
        orderNumber: generateOrderNumber(),
        ...args
      })
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
            unit_price: price * 100, //Intentar cambiar los precios de los productos a precio COP
            quantity: quantity
          })
        ),
        back_urls: {
          success: `${process.env.CLIENT_ORIGIN}/order/mercadopago`,
          failure: `${process.env.CLIENT_ORIGIN}/order/mercadopago`,
          pending: `${process.env.CLIENT_ORIGIN}/order/mercadopago`
        },
        auto_return: 'approved',
        notification_url:
          'https://1377-181-128-53-84.ngrok-free.app/webhooks/mercadopago'
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
    }
  }
}

export default resolvers
