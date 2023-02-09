import * as dotenv from 'dotenv'
import mongoose from 'mongoose'

let db = null
dotenv.config() // enable all environment variables

const connectDB = async () => {
  if (!db) {
    mongoose.set('strictQuery', false)
    db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('Connected successfully to the MongoDB database')
  }
  return db
}

const disconnectDB = async () => {
  if (db) {
    await db.disconnect()
    db = null
    console.log('Disconnected from the MongoDB database')
  }
}

export default { connectDB, disconnectDB }
