import * as dotenv from 'dotenv'
import mongoose from 'mongoose'

mongoose.set('strictQuery', false)
dotenv.config()
const connection = {}

async function connect() {
  if (connection.isConnected) {
    console.log('We are already connected')
    return
  }
  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState
    if (connection.isConnected === 1) {
      console.log('Use previous connection')
      return
    }
    await mongoose.disconnect()
  }
  const db = await mongoose.connect(process.env.MONGODB_URI)
  console.log('New connection')
  connection.isConnected = db.connections[0].readyState
}

async function disconnect() {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === 'production') {
      await mongoose.disconnect()
      connection.isConnected = false
    } else {
      console.log('Not disconnected')
    }
  }
}

const db = { connect, disconnect }

export default db
