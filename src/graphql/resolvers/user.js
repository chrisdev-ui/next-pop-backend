import User from '../../models/User.js'

const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
    countUsers: async (_, args, context) => {
      const { db } = context
      await db.connect()
      return User.collection.countDocuments()
    }
  }
}

export default resolvers
