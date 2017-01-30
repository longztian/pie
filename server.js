import Koa from 'koa'
import logger from 'koa-logger'
import session from 'koa-session-minimal'
import redisStore from 'koa-redis'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import { graphqlKoa, graphiqlKoa } from 'graphql-server-koa'
import schema from './schema'
import formidable from './formidable'

const ONE_MONTH = 30 * 24 * 3600000
const PORT = 3000

const app = new Koa()
const router = new Router()

// ALLOW PROXY REQUESTS
app.proxy = true

app.use(logger())

app.use(session({
  key: 'sid',
  store: redisStore(),
  cookie: {
    maxAge: ONE_MONTH,
    httpOnly: false,
  },
}))

app.use(bodyParser())

router.post('/upload', formidable())

router.post('/graphql', graphqlKoa(ctx => ({
  schema,
  context: ctx,
})))
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }))

app.use(router.routes())
app.use(router.allowedMethods())

app.on('error', err =>
  process.stderr.write(`server error ${err}\n`),
)

app.listen(PORT)
