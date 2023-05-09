// MercadoPago Webhook Responses Types
export const WEBHOOK_TYPE = {
  PAYMENT: 'payment',
  PLAN: 'plan',
  SUBSCRIPTION: 'subscription',
  INVOICE: 'invoice',
  POINT_INTEGRATION_WH: 'point_integration_wh'
}

export const PAYPAL_WEBHOOK_TYPE = {
  CHECKOUT_ORDER: 'checkout-order'
}

export const PAYMENT = {
  approved: 'approved',
  accredited: 'accredited'
}

export const BANCOLOMBIA_TRANSFER_STATES = {
  approved: 'approved',
  rejected: 'rejected',
  pending: 'pending'
}

// Payment Methods
export const PAYMENT_METHOD = {
  MERCADOPAGO: 'MercadoPago',
  PAYPAL: 'Paypal',
  BOTON_BANCOLOMBIA: 'Botón Bancolombia'
}

export const GET_SENDINGS_MP = {
  pageSizeDefault: 10
}
