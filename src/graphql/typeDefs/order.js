import { gql } from 'apollo-server-core'

const typeDefs = gql`
  scalar Date

  type Order {
    _id: ID!
    user: User!
    orderItems: [OrderItem!]!
    shippingAddress: ShippingAddress!
    paymentMethod: String!
    itemsPrice: Float!
    shippingPrice: Float!
    taxPrice: Float!
    totalPrice: Float!
    isPaid: Boolean!
    isDelivered: Boolean!
    paidAt: Date
    deliveredAt: Date
    createdAt: Date!
    updatedAt: Date!
  }

  type OrderItem {
    name: String!
    quantity: Int!
    image: String!
    price: Float!
    slug: String!
  }

  type ShippingAddress {
    fullName: String!
    address: String!
    city: String!
    postalCode: String
    country: String!
  }

  input OrderItemInput {
    name: String!
    quantity: Int!
    image: String!
    price: Float!
    slug: String!
  }

  input ShippingAddressInput {
    fullName: String!
    address: String!
    city: String!
    postalCode: String
    country: String!
  }

  type Mutation {
    createOrder(
      orderItems: [OrderItemInput!]!
      shippingAddress: ShippingAddressInput!
      paymentMethod: String!
      itemsPrice: Float!
      shippingPrice: Float!
      taxPrice: Float!
      totalPrice: Float!
    ): Order!
  }
`
export default typeDefs
