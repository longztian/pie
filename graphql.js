import convert from 'koa-convert'
import graphqlHTTP from 'koa-graphql'
import { buildSchema } from 'graphql'
import schema from './schema'
import resolve from './resolve'

export default convert(graphqlHTTP({
  schema: buildSchema(schema),
  root: resolve,
  graphiql: true,
}))


/* client side
UPDATE:

mutation {
  addUser(id: "d", username: "ddddd") {
    id,
    username
  }
}


QUERY:

{
  viewer(id: "d") {
    id,
    username
  }
}

*/
