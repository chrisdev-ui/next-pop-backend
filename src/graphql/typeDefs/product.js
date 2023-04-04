import { gql } from 'apollo-server-core'

const typeDefs = gql`
  type Product {
    _id: ID!
    name: String!
    slug: String!
    category: String!
    image: String!
    imageOnHover: String!
    images: [String!]!
    price: Int!
    brand: String!
    rating: Float!
    numReviews: Int!
    countInStock: Int!
    description: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type Query {
    getAllProducts: [Product!]!
    getProductBySlug(slug: String!): Product
    getProductStockCount(id: ID!): Int!
  }
`
export default typeDefs
