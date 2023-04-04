import generateShortUid from './generate-short-uid.js'

function generateOrderNumber() {
  const date = new Date()
  const year = date.getFullYear().toString().padStart(4, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const shortUid = generateShortUid(5)
  const orderNumber = `${year}${month}${day}${shortUid}`
  return orderNumber
}

export default generateOrderNumber
