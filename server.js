import Koa from 'koa'
import logger from 'koa-logger'
import session from 'koa-session-minimal'
import redisStore from 'koa-redis'
import convert from 'koa-convert'
import graphql from './schema'

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

app.use(graphql)

app.on('error', err =>
  process.stderr.write(`server error ${err}\n`)
)

app.listen(3000)
