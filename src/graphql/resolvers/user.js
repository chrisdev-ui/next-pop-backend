import { AuthenticationError, UserInputError } from 'apollo-server-core'
import bcryptjs from 'bcryptjs'
import { GraphQLError } from 'graphql'
import User from '../../db/models/User.js'

const resolvers = {
  Query: {
    getUserByEmail: async (_, { email }) => {
      try {
        return await User.findOne({ email })
      } catch (error) {
        throw new GraphQLError(
          `There was an error tryng to retrieve data of user with email = ${email}`,
          {
            extensions: { code: 'ERROR_CONNECTING_TO_DATABASE' }
          }
        )
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
        throw new AuthenticationError(error)
      }
    },
    registerUser: async (
      _,
      { input: { name, email, password, profilePicture, isAdmin } },
      { session }
    ) => {
      const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i
      if (
        !name ||
        !email ||
        !emailRegex.test(email) ||
        !password ||
        password.trim().length < 5
      )
        throw new UserInputError(
          'Error validating name, email or password from user input'
        )

      const existingUser = await User.findOne({ email })
      if (existingUser) throw new UserInputError('Email already in use')

      const checkIfUserIsAdmin = () => {
        if (session && session.user.isAdmin) {
          return isAdmin
        }
        return false
      }

      return await User.create({
        name,
        email,
        password: bcryptjs.hashSync(password),
        profilePicture: profilePicture || '',
        isAdmin: checkIfUserIsAdmin()
      })
    }
  }
}

export default resolvers
