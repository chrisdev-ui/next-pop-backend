import { gql } from 'apollo-server-core'

const typeDefs = gql`
  type Product {
    _id: ID!
    name: String!
    slug: String! @unique
    category: String!
    image: String!
    imageOnHover: String!
    images: [String!]!
    price: Int!
    brand: String!
    rating: Int! = 0
    numReviews: Int! = 0
    countInStock: Int! = 0
    description: String!
  }

  type Query {
  }
`
export default typeDefs
