import { GraphQLScalarType, Kind } from 'graphql'

const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'The `JSON` scalar type represents JSON objects.',
  serialize(value) {
    return value // The JSON object is returned as-is
  },
  parseValue(value) {
    return value // The JSON object is returned as-is
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value)
      case Kind.OBJECT:
        let value = Object.create(null)
        ast.fields.forEach((field) => {
          value[field.name.value] = this.parseLiteral(field.value)
        })
        return value
      default:
        return null
    }
  }
})

export default jsonScalar
