import { gql } from 'apollo-server-core'

const typeDefs = gql`
  type User {
    _id: ID!
    name: String!
    email: String! @unique
    password: String!
    profilePicture: String
    isAdmin: Boolean!
  }

  type Query {
    getUserByEmail(email: String!): User
  }
`
export default typeDefs
