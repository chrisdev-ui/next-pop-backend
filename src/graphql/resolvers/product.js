import { GraphQLError } from 'graphql'
import Product from '../../db/models/Product.js'

const resolvers = {
  Query: {
    getAllProducts: async () => {
      try {
        return await Product.find()
      } catch (error) {
        throw new GraphQLError('Can not find products in the database', {
          extensions: { code: 'ERROR_CONNECTING_TO_DATABASE' }
        })
      }
    },
    getProductBySlug: async (_, { slug }) => {
      try {
        return (await Product.findOne({ slug })) ?? null
      } catch (error) {
        throw new GraphQLError('Can not find product in the database', {
          extensions: { code: 'ERROR_CONNECTING_TO_DATABASE' }
        })
      }
    }
  }
}

export default resolvers
