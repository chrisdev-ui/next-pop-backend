import { makeExecutableSchema } from '@graphql-tools/schema'
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault
} from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-express'
import * as dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import { getSession } from 'next-auth/react'
import db from '../src/db/index.js'
import MercadoPago from './controllers/mercadopago-webhook.js'
import Paypal from './controllers/paypal-webhook.js'
import resolvers from './graphql/resolvers/index.js'
import typeDefs from './graphql/typeDefs/index.js'
import mercadopago from './services/mercadopago.js'

const { connectDB, disconnectDB } = db

async function main() {
  dotenv.config()
  const app = express()
  const httpServer = http.createServer(app)
  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: 'bounded',
    context: async ({ req, res }) => {
      const session = await getSession({ req })
      return { session, db: connectDB(), mercadopago }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true })
    ]
  })

  const corsOptions = { origin: process.env.CLIENT_ORIGIN, credentials: true }

  await server.start()
  server.applyMiddleware({
    app,
    cors: corsOptions
  })

  app.post(
    '/webhooks/mercadopago',
    express.json(),
    MercadoPago.webhookController
  )

  app.post('/webhooks/paypal', express.json(), Paypal.webhookController)

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve))
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
}

main().catch((err) => console.log(err))

process.on('SIGTERM', () => {
  console.log('Database connection closed')
  disconnectDB()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('Database connection closed')
  disconnectDB()
  process.exit(0)
})
