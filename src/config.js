// MercadoPago Webhook Responses Types
export const WEBHOOK_TYPE = {
  PAYMENT: 'payment',
  PLAN: 'plan',
  SUBSCRIPTION: 'subscription',
  INVOICE: 'invoice',
  POINT_INTEGRATION_WH: 'point_integration_wh'
}

export const PAYMENT = {
  approved: 'approved',
  accredited: 'accredited'
}

// Payment Methods
export const PAYMENT_METHOD = {
  MERCADOPAGO: 'MercadoPago',
  PAYPAL: 'Paypal'
}
