const Koa = require('koa')
const logger = require('koa-logger')
const session = require('koa-session-minimal')
const redisStore = require('koa-redis')
const convert = require('koa-convert')
const graphqlHTTP = require('koa-graphql')
const graphql = require('graphql')

const app = new Koa()

// ALLOW PROXY REQUESTS
app.proxy = true

app.use(logger())

const ONE_MONTH = 30 * 24 * 3600000

// app.keys = ['Rose', 'Life']
app.use(session({
  key: 'sid',
  store: redisStore(),
  cookie: {
    maxAge: ONE_MONTH,
    httpOnly: false,
  },
}))

const MyGraphQLSchema = graphql.buildSchema(`
  type Query {
    hello: String
  }
`)

const root = { hello: () => 'Hello world!' }

app.use(convert(graphqlHTTP({
  schema: MyGraphQLSchema,
  rootValue: root,
  graphiql: true,
})))

app.on('error', err =>
  process.stderr.write(`server error ${err}\n`)
)

app.listen(3000)
