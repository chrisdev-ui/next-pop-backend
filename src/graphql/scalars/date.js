import { UserInputError } from 'apollo-server-core'
import { GraphQLScalarType, Kind } from 'graphql'
import dateToString from '../utils/date-to-string.js'
import stringToDate from '../utils/string-to-date.js'

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Simple date scalar type',
  serialize(value) {
    return dateToString(value)
  },
  parseValue(value) {
    return stringToDate(value)
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return stringToDate(ast.value)
    }
    throw new UserInputError('The provided date has incorrect format')
  }
})

export default dateScalar
