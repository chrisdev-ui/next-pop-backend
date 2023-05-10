export const validateIfUserWantSending = (order) =>
  order.shippingInfo.deliveryCompany && Number(order.shippingPrice) > 0

export const createShipmentItem = (order, user) => {
  const {
    h: height,
    w: width,
    l: large,
    wg: weight
  } = assignPackageSize(order.orderItems)
  return {
    order: order._id.toString(),
    receiver: {
      name: order.shippingInfo.fullName,
      email: user.email,
      ...(order.shippingInfo.country && {
        prefix: COUNTRIES.find(
          (country) => country.name === order.shippingInfo.country
        ).prefix
      }),
      cellPhone: order.shippingInfo.cellPhone,
      destinationAddress: order.shippingInfo.address,
      ...(order.shippingInfo.nit && { nit: order.shippingInfo.nit }),
      ...(order.shippingInfo.nitType && { nitType: order.shippingInfo.nitType })
    },
    productInformation: {
      width,
      large,
      height,
      weight,
      productReference: order._id.toString()
    },
    locale: {
      originDaneCode: MEDELLIN_LOCATION_CODE,
      destinyDaneCode: order.shippingInfo.city
    },
    deliveryCompany: order.shippingInfo.deliveryCompany,
    ...(order.shippingInfo.isCashOnDelivery && { paymentType: 102 }),
    ...(order.shippingInfo.isCashOnDelivery && {
      valueCollection: order.shippingPrice
    }),
    adminTransactionData: {
      saleValue: order.shippingInfo.isCashOnDelivery ? order.shippingPrice : 0
    },
    isCashOnDelivery: order.shippingInfo.isCashOnDelivery
  }
}

const criticalItems = []

const MEDELLIN_LOCATION_CODE = '05001000' // Change in any case where address will be changed

const MEASUREMENTS = {
  standard: {
    h: 9,
    w: 15,
    l: 22,
    wg: 1
  },
  large: {
    h: 9,
    w: 28,
    l: 35,
    wg: 1
  }
}

const assignPackageSize = (items = []) => {
  const isCritical = items.some((item) => criticalItems.includes(item.slug))
  return isCritical ? MEASUREMENTS.large : MEASUREMENTS.standard
}

const COUNTRIES = [
  { name: 'Argentina', code: '032', prefix: '+54', flag: '🇦🇷' },
  { name: 'Bolivia', code: '068', prefix: '+591', flag: '🇧🇴' },
  { name: 'Brazil', code: '076', prefix: '+55', flag: '🇧🇷' },
  { name: 'Chile', code: '152', prefix: '+56', flag: '🇨🇱' },
  { name: 'Colombia', code: '170', prefix: '+57', flag: '🇨🇴' },
  { name: 'Costa Rica', code: '188', prefix: '+506', flag: '🇨🇷' },
  { name: 'Cuba', code: '192', prefix: '+53', flag: '🇨🇺' },
  { name: 'Dominican Republic', code: '214', prefix: '+1', flag: '🇩🇴' },
  { name: 'Ecuador', code: '218', prefix: '+593', flag: '🇪🇨' },
  { name: 'El Salvador', code: '222', prefix: '+503', flag: '🇸🇻' },
  { name: 'Guatemala', code: '320', prefix: '+502', flag: '🇬🇹' },
  { name: 'Haiti', code: '332', prefix: '+509', flag: '🇭🇹' },
  { name: 'Honduras', code: '340', prefix: '+504', flag: '🇭🇳' },
  { name: 'Jamaica', code: '388', prefix: '+1', flag: '🇯🇲' },
  { name: 'Mexico', code: '484', prefix: '+52', flag: '🇲🇽' },
  { name: 'Nicaragua', code: '558', prefix: '+505', flag: '🇳🇮' },
  { name: 'Panama', code: '591', prefix: '+507', flag: '🇵🇦' },
  { name: 'Paraguay', code: '600', prefix: '+595', flag: '🇵🇾' },
  { name: 'Peru', code: '604', prefix: '+51', flag: '🇵🇪' },
  { name: 'Puerto Rico', code: '630', prefix: '+1', flag: '🇵🇷' },
  { name: 'Trinidad and Tobago', code: '780', prefix: '+1', flag: '🇹🇹' },
  { name: 'Uruguay', code: '858', prefix: '+598', flag: '🇺🇾' },
  { name: 'Venezuela', code: '862', prefix: '+58', flag: '🇻🇪' }
]
