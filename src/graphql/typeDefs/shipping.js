import { gql } from 'apollo-server-core'

const typeDefs = gql`
  type Shipment {
    _id: ID!
    trackingNumber: Int!
    order: Order!
    sender: Sender!
    receiver: Receiver!
    productInformation: ProductInformation!
    locate: Locate!
    channel: String!
    user: String
    deliveryCompany: String!
    description: String
    comments: String
    paymentType: Int!
    valueCollection: Float!
    requestPickup: Boolean!
    adminTransactionData: AdminTransactionData
    pickupDate: Date
    deliveryDate: Date
    isCashOnDelivery: Boolean!
    status: String!
    createdAt: Date
    updatedAt: Date
  }

  type Sender {
    name: String!
    surname: String!
    cellPhone: String!
    prefix: String!
    email: String!
    pickupAddress: String!
    nit: String
    nitType: NitType
  }

  type Receiver {
    name: String!
    surname: String!
    email: String!
    prefix: String!
    cellPhone: String!
    destinationAddress: String!
    nit: String
    nitType: NitType
  }

  type ProductInformation {
    quantity: Int!
    width: Int!
    large: Int!
    height: Int!
    weight: Int!
    forbiddenProduct: Boolean
    productReference: String
    declaredValue: Float!
  }

  type Locate {
    originDaneCode: String!
    destinyDaneCode: String!
  }

  type AdminTransactionData {
    saleValue: Float!
  }

  enum NitType {
    NIT
    CC
    CE
    TI
  }

  type LocationsResponse {
    _id: String!
    locationName: String!
    departmentOrStateName: String!
    locationCode: String!
    departmentOrStateCode: String!
    tccCode: String
    countryId: String!
    countryCode: String!
    deprisaCode: String
    deprisaName: String
  }

  input QuoteShippingInput {
    originLocationCode: String!
    destinyLocationCode: String!
    height: Int!
    width: Int!
    length: Int!
    weight: Int!
    quantity: Int!
    declaredValue: Float!
    saleValue: Float
  }

  input CreateShippingInput {
    order: ID!
    sender: SenderInput
    receiver: ReceiverInput!
    productInformation: ProductInformationInput!
    locate: LocateInput!
    channel: String
    user: String
    deliveryCompany: String!
    description: String
    comments: String
    paymentType: Int
    valueCollection: Float
    requestPickup: Boolean
    adminTransactionData: AdminTransactionDataInput
    isCashOnDelivery: Boolean
  }

  input SenderInput {
    name: String
    surname: String
    cellPhone: String
    prefix: String
    email: String
    pickupAddress: String
    nit: String
    nitType: String
  }

  input ReceiverInput {
    name: String!
    surname: String
    email: String!
    prefix: String
    cellPhone: String!
    destinationAddress: String!
    nit: String
    nitType: String
  }

  input ProductInformationInput {
    quantity: Int
    width: Int!
    large: Int!
    height: Int!
    weight: Int!
    forbiddenProduct: Boolean
    productReference: String
    declaredValue: Float
  }

  input LocateInput {
    originDaneCode: String!
    destinyDaneCode: String!
  }

  input AdminTransactionDataInput {
    saleValue: Float
  }

  type QuoteShippingResult {
    id: String!
    deliveryCompanyName: String!
    deliveryCompanyImgUrl: String
    shippingCost: Float!
    collectionCommissionWithRate: Float
    collectionCommissionWithOutRate: Float
    isMessengerService: Boolean
    shippingTime: Int!
    realWeightVolume: Int
    officeAddress: String
    forwardingService: Boolean
    singleOfficeDelivery: Boolean
    pickupService: Boolean
    pickupTime: Int!
    deliveryCompanyId: String!
    score: Float
  }

  input ConfirmationDateInput {
    init: String
    end: String
  }

  input GetSendingsInput {
    pageSize: Int
    deliveryCompany: [String!]
    confirmationDate: ConfirmationDateInput
    mpCode: Int
    shipmentId: ID
  }

  type GetSendingsResponse {
    totalItems: Int!
    sendings: [Sending!]!
  }

  type Tracking {
    updateState: String!
    date: String!
    description: String
  }

  type Sending {
    _id: ID!
    deliveryCompany: String!
    tracking: [Tracking]!
    userId: String
    productOrReference: String
    mpCode: Int
    guideNumber: String
    pickupNumber: String
    channel: String
    serviceType: String
    requestDate: String
    requestTime: String
    pickupDate: String
    origin: String
    senderName: String
    senderIdentificationType: String
    senderIdentification: String
    senderCellphone: String
    senderAddress: String
    destination: String
    recipientDocument: String
    recipientName: String
    recipientCellphone: String
    recipientAddress: String
    quantity: Int
    dimensions: String
    volumetricWeight: Float
    weight: Float
    invoicedWeight: Float
    additionalService: String
    cashOnDeliveryValue: Float
    bank: String
    beneficiaryName: String
    accountNumber: String
    beneficiaryIdentification: String
    identificationType: String
    accountType: String
    declaredValue: Float
    carrier: String
    salesValue: Float
    freightValue: Float
    collectionCommissionValue: Float
    totalServiceValue: Float
    transferValue: Float
    paymentMethod: String
    currentStatus: String
    lastUpdateDate: String
    lastUpdateTime: String
    promisedDeliveryTime: Int
    observations: String
    collectionCommissionRefundValue: Float
    returnFreightValue: Float
    totalShippingCost: Float
    pendingChargeCost: Float
    senderEmail: String
    height: Int
    length: Int
    width: Int
    transmittedDeclaredValue: Float
    insurancePercentageChargedByCarrier: Float
    handlingPercentageChargedByCarrier: Float
    fullRateFreightValue: String
    discountPercentage: String
    savings: String
    journeyType: String
    agencyTypeShipping: String
    whatsappNotificationPickup: String
    whatsappNotificationInTransit: String
    whatsappNotificationDestinationCity: String
    whatsappNotificationDistribution: String
    whatsappNotificationDelivered: String
  }

  type SendingTrackingResponse {
    deliveryCompanyName: String!
    deliveryCompany: ID!
    tracking: [Tracking]!
    mpCode: Int!
    origin: String!
    destiny: String!
  }

  type DeliveryCompany {
    _id: ID!
    name: String!
    image: String!
  }

  type CancelSendingResponse {
    message: String!
    cashMovement: CashMovement!
  }

  type CashMovement {
    userInfo: UserInfo!
    transactions: Transaction!
    message: String!
  }

  type Transaction {
    productCode: Int
    paymentType: Int
    user: ID
    paymentPrice: Int
    cash: Int
    newCash: Int
    transactionType: String
    description: String
    createdAt: String
    updatedAt: String
    _id: ID
  }

  type UserInfo {
    userId: ID
    cash: Int
    cashComission: String
    cashSending: Int
    newCash: Int
    message: String
  }

  type Direction {
    _id: ID
    locationCode: String
    locationName: String
    departmentOrStateCode: String
    departmentOrStateName: String
    name: String
    address: String
    countryCode: String
    user: ID
    createdAt: String
    updatedAt: String
  }

  input DirectionInput {
    locationCode: String!
    name: String!
    address: String!
  }

  input DirectionUpdateInput {
    locationCode: String!
    name: String
    address: String
    _id: ID!
  }

  type Query {
    getLocations(locationCode: String): [LocationsResponse]!
    getSendings(input: GetSendingsInput): GetSendingsResponse!
    getSendingTracking(mpCode: Int!): SendingTrackingResponse
    deliveryCompanies: [DeliveryCompany!]!
    getMpDirections: [Direction]!
  }

  type Mutation {
    quoteShipping(input: QuoteShippingInput!): [QuoteShippingResult]!
    createShipping(input: CreateShippingInput!): Shipment
    cancelSending(mpCode: Int!): CancelSendingResponse!
    createMpDirections(input: [DirectionInput!]!): [Direction!]!
    updateMpDirections(input: [DirectionUpdateInput!]!): [Direction!]!
    deleteMpDirections(myDirections: [String!]!): Boolean!
  }
`

export default typeDefs
