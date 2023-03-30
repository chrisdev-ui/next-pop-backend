import mongoose from 'mongoose'

// const productImageSchema = new mongoose.Schema({
//   url: {
//     type: String,
//     required: true
//   },
//   alt: {
//     type: String
//   },
//   caption: {
//     type: String
//   }
// })

// TODO: Remove String type from images and use productImageSchema defined above

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    imageOnHover: { type: String, required: true },
    images: { type: [String], required: true },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    description: { type: String, required: true }
  },
  { timestamps: true }
)

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema)

export default Product
