import { UserInputError } from 'apollo-server-core'
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
        const product = await Product.findOne({ slug })
        if (!product)
          throw new UserInputError(`Product with slug ${slug} not found.`)
        return product
      } catch (error) {
        console.error(
          `Error getting product with slug ${slug}: ${error.message}`
        )
        throw new GraphQLError('Could not get product by slug', {
          extensions: { code: 'ERROR_CONNECTING_TO_DATABASE' }
        })
      }
    },
    getProductStockCount: async (_, { id }) => {
      try {
        const product = await Product.findById(id)
        if (!product)
          throw new UserInputError(`Product with ID ${id} does not exist`)
        return product.countInStock || 0
      } catch (error) {
        throw new GraphQLError(
          `Unable to retrieve the count in stock of product with ID ${id}`,
          {
            extensions: { code: 'ERROR_CONNECTING_TO_DATABASE' }
          }
        )
      }
    }
  }
}

export default resolvers
