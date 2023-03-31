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
  }

  type Query {
    getAllProducts: [Product!]!
    getProductBySlug(slug: String!): Product
  }
`
export default typeDefs
