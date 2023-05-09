import { gql } from 'apollo-server-core'

const typeDefs = gql`
  scalar Date
  scalar JSON

  type Order {
    _id: ID!
    user: User!
    orderNumber: String!
    orderItems: [OrderItem!]!
    shippingInfo: ShippingInfo!
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

  type ShippingInfo {
    fullName: String!
    cellPhone: String!
    address: String!
    city: String!
    department: String!
    country: String!
    nit: String
    nitType: NitType
    isCashOnDelivery: Boolean!
    deliveryCompany: String
  }

  input OrderItemInput {
    name: String!
    quantity: Int!
    image: String!
    price: Float!
    slug: String!
  }

  input ShippingInfoInput {
    fullName: String!
    cellPhone: String!
    address: String!
    city: String!
    department: String!
    country: String!
    nit: String
    nitType: NitType
    isCashOnDelivery: Boolean
    deliveryCompany: String
  }

  type BancolombiaValidationResponse {
    meta: BancolombiaMetaData!
    data: [BancolombiaTransferValidationData!]!
  }

  type BancolombiaTransferValidationData {
    header: TransferHeader!
    transferState: String!
    transferReference: String!
    transferAmount: Float!
  }

  type Query {
    getOrderById(id: ID!): Order
    paypalClientId: String!
    validateBancolombiaTransfer(
      transferCode: String!
    ): BancolombiaValidationResponse!
  }

  type Preference {
    preferenceId: String!
    initPointUrl: String!
  }

  input PayPalOrderInput {
    fromCurrencyCode: String!
    currencyCode: String!
    orderId: ID!
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

  input CapturePaymentInput {
    paypalOrderId: ID!
    orderId: ID!
  }

  input TransferRegistryInput {
    commerceTransferButtonId: String
    transferReference: ID!
    transferDescription: String
  }

  type BancolombiaMetaData {
    _messageId: ID!
    _version: String!
    _requestDate: String!
    _responseSize: Int!
    _clientRequest: String!
  }

  type TransferHeader {
    type: String!
    id: ID!
  }

  type BancolombiaTransferData {
    header: TransferHeader!
    transferCode: String!
    redirectURL: String!
  }

  type TransferRegistryResponse {
    meta: BancolombiaMetaData!
    data: [BancolombiaTransferData!]!
  }

  type Mutation {
    createOrder(
      orderItems: [OrderItemInput!]!
      shippingInfo: ShippingInfoInput!
      paymentMethod: String!
      itemsPrice: Float!
      shippingPrice: Float!
      taxPrice: Float!
      totalPrice: Float!
    ): Order!
    newPreference(storeOrderId: ID!): Preference
    createPayPalOrder(orderData: PayPalOrderInput!): PayPalOrder
    capturePayPalPayment(paymentData: CapturePaymentInput!): Order
    createBancolombiaTransfer(
      orderData: TransferRegistryInput!
    ): TransferRegistryResponse!
  }
`
export default typeDefs
