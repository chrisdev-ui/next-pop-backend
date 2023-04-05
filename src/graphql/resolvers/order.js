import { AuthenticationError, ForbiddenError } from 'apollo-server-core'
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
    }
  }
}

export default resolvers
