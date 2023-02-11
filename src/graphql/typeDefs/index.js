import { loadFiles } from '@graphql-tools/load-files'
import { mergeTypeDefs } from '@graphql-tools/merge'
import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const typeDefFiles = await loadFiles(`${__dirname}/*.js`, {
  ignoreIndex: true,
  requireMethod: async (path) => {
    return await import(url.pathToFileURL(path))
  }
})
const typeDefs = mergeTypeDefs(typeDefFiles)

export default typeDefs
