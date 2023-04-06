import { gql } from 'apollo-server-core'

const typeDefs = gql`
  type User {
    _id: ID!
    name: String!
    email: String!
    password: String!
    profilePicture: String
    isAdmin: Boolean!
    createdAt: Date!
    updatedAt: Date!
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

  input RegisterUserInput {
    name: String!
    email: String!
    password: String!
    isAdmin: Boolean
    profilePicture: String
  }

  type Query {
    getUserByEmail(email: String!): User
  }

  type Mutation {
    login(email: String!, password: String!): AuthenticationPayload
    registerUser(input: RegisterUserInput!): User
  }
`
export default typeDefs
