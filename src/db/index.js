import * as dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config() // enable all environment variables

let isConnected = false

const connectDB = async () => {
  if (!isConnected) {
    mongoose.set('strictQuery', false)
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    isConnected = true
    console.log('Connected successfully to the MongoDB database')
  }
}

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect()
    isConnected = false
    console.log('Disconnected from the MongoDB database')
  }
}

export default { connectDB, disconnectDB }
