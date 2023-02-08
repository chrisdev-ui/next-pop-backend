import User from '../../models/User.js'

const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
    countUsers: async (_, args, context) => {
      const { db } = context
      await db.connect()
      const users = await User.collection.countDocuments()
      await db.disconnect()
      return users
    }
  }
}

export default resolvers
