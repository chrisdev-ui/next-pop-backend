import { GraphQLError } from 'graphql'
import User from '../../db/models/User.js'

const resolvers = {
  Query: {
    getUserByEmail: async (_, { email }) => {
      try {
        return await User.findOne({ email })
      } catch (error) {
        throw new GraphQLError("Can't retrieve user from database", {
          extensions: { code: 'ERROR_CONNECTING_TO_DATABASE' }
        })
      }
    }
  }
}

export default resolvers
