import bcryptjs from 'bcryptjs'
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
  },
  Mutation: {
    login: async (_, { email, password }) => {
      try {
        const user = await User.findOne({ email })
        if (!user) {
          return { error: 'email or password does not match with our records' }
        }
        const matched = bcryptjs.compareSync(password, user.password)
        if (!matched) {
          return { error: 'email or password does not match with our records' }
        }
        return {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            isAdmin: user.isAdmin
          }
        }
      } catch (error) {
        throw new GraphQLError("Can't retrieve user from database", {
          extensions: { code: 'AUTHENTICATION_ERROR' }
        })
      }
    }
  }
}

export default resolvers
