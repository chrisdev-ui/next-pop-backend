import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'

const {
  MIPAQUETE_API_KEY,
  MIPAQUETE_API,
  MIPAQUETE_USERNAME,
  MIPAQUETE_PASSWORD
} = process.env

const MiPaquete = {}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function generateApiKey() {
  if (!MIPAQUETE_API_KEY) {
    const sessionTracker = uuidv4()
    const url = `${MIPAQUETE_API}/generateapikey`
    const headers = {
      'session-tracker': sessionTracker
    }
    const credentialData = {
      email: MIPAQUETE_USERNAME,
      password: MIPAQUETE_PASSWORD
    }
    try {
      const {
        data: { APIKey }
      } = await axios.post(url, credentialData, {
        headers
      })
      const envContent = `\nMIPAQUETE_API_KEY=${APIKey}\n`
      const envPath = path.resolve(__dirname, '..', '..', '.env')
      fs.appendFile(envPath, envContent, (err) => {
        if (err) {
          console.error('Error writing to .env file:', err)
        } else {
          console.log('API key successfully written to .env file')
        }
      })
    } catch (error) {
      console.error(error)
      throw new Error(`Error: ${error.message}`)
    }
  }
}

MiPaquete.generateApiKey = generateApiKey

export default MiPaquete
