import User from '../../db/models/User.js'

const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
    countUsers: async (_, args, { db }) => {
      try {
        return await User.collection.countDocuments()
      } catch (error) {
        throw new Error(`Error counting users: ${error}`)
      }
    }
  }
}

export default resolvers
