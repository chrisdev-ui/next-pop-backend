import { GraphQLError } from 'graphql'
import Product from '../../db/models/Product.js'

const resolvers = {
  Query: {
    getAllProducts: async () => {
      try {
        return await Product.find()
      } catch (error) {
        throw new GraphQLError(
          'There was an error trying to get products from database',
          {
            extensions: { code: 'ERROR_CONNECTING_TO_DATABASE' }
          }
        )
      }
    },
    getProductBySlug: async (_, { slug }) => {
      try {
        return (await Product.findOne({ slug })) ?? null
      } catch (error) {
        throw new GraphQLError(
          `There was an error trying to get product ${slug} from database`,
          {
            extensions: { code: 'ERROR_CONNECTING_TO_DATABASE' }
          }
        )
      }
    },
    getProductStockCount: async (_, { id }) => {
      try {
        const product = await Product.findById(id)
        return product.countInStock || 0
      } catch (error) {
        throw new GraphQLError(
          `Unable to retrieve the count in stock of product with ID = ${id}`,
          {
            extensions: { code: 'ERROR_CONNECTING_TO_DATABASE' }
          }
        )
      }
    }
  }
}

export default resolvers
