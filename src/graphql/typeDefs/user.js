import { gql } from 'apollo-server-core'

const typeDefs = gql`
  type Query {
    hello: String
    countUsers: Int!
  }
`
export default typeDefs
