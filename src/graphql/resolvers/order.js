import { AuthenticationError } from 'apollo-server-core'
import Order from '../../db/models/Order.js'

const resolvers = {
  Mutation: {
    createOrder: async (_, args, { session }) => {
      try {
        if (!session) throw new AuthenticationError('User not logged in')
        return await Order.create({ user: session?.user._id, ...args })
      } catch (error) {
        throw new GraphQLError('Cannot create a new order in database', {
          extensions: { code: 'ERROR_CONNECTING_TO_DATABASE' }
        })
      }
    }
  }
}

export default resolvers
