import mongoose from 'mongoose'

const productImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  alt: {
    type: String
  },
  caption: {
    type: String
  }
})

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    image: { type: productImageSchema, required: true },
    imageOnHover: { type: productImageSchema, required: true },
    images: { type: [productImageSchema], required: true },
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
