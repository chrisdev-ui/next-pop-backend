import { gql } from 'apollo-server-core'

const typeDefs = gql`
  type User {
    _id: ID!
    name: String!
    email: String!
    password: String!
    profilePicture: String
    isAdmin: Boolean!
  }

  type AuthorizedUser {
    _id: ID!
    name: String!
    email: String!
    profilePicture: String
    isAdmin: Boolean!
  }

  type AuthenticationPayload {
    user: AuthorizedUser
    error: String
  }

  type Query {
    getUserByEmail(email: String!): User
  }

  type Mutation {
    login(email: String!, password: String!): AuthenticationPayload
  }
`
export default typeDefs
