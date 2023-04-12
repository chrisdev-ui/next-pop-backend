import { gql } from 'apollo-server-core'

const typeDefs = gql`
  scalar Date
  scalar JSON

  type Order {
    _id: ID!
    user: User!
    orderNumber: String!
    orderItems: [OrderItem!]!
    shippingAddress: ShippingAddress!
    paymentMethod: String!
    itemsPrice: Float!
    shippingPrice: Float!
    taxPrice: Float!
    totalPrice: Float!
    isPaid: Boolean!
    isDelivered: Boolean!
    paymentResult: PaymentResult
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

  type PaymentResult {
    id: ID
    order: MerchantOrder
    status: String
    result: String
    payer: PayerOrder
  }

  type MerchantOrder {
    id: ID
    type: String
  }

  type PayerOrder {
    firstName: String
    email: String
    lastName: String
    phone: String
    identification: IdentificationPayer
  }

  type IdentificationPayer {
    number: String
    type: String
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

  type Query {
    getOrderById(id: ID!): Order
    paypalClientId: String!
  }

  type Preference {
    preferenceId: String!
    initPointUrl: String!
  }

  input PayPalOrderInput {
    totalAmount: Float!
    currencyCode: String!
  }

  type PayPalLink {
    href: String
    rel: String
    method: String
  }

  type PayPalOrder {
    id: ID!
    status: String
    links: [PayPalLink!]
  }

  input capturePaymentInput {
    paypalOrderId: ID!
    orderId: ID!
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
    newPreference(storeOrderId: ID!): Preference
    createPayPalOrder(orderData: PayPalOrderInput!): PayPalOrder
    capturePayPalPayment(paymentData: capturePaymentInput!): Order
  }
`
export default typeDefs
