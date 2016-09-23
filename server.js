const debug = require('debug')('pie')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const router = require('./router')
const session = require('koa-session-minimal')
const redisStore = require('koa-redis')

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

app.use(bodyParser())

app.use(router.routes())
  .use(router.allowedMethods())

app.on('error', err =>
  process.stderr.write(`server error ${err}\n`)
)

app.listen(3000)
