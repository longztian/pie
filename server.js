const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const debug = require('debug')('pie')
const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const router = require('./router')

const app = new Koa()

// ALLOW PROXY REQUESTS
app.proxy = true

app.use(logger())

app.keys = ['Rose', 'Life']
app.use(session({
  store: redisStore(),
  key: 'sid',
  cookie: {
    httpOnly: false,
    signed: false,
    maxAge: 60 * 24 * 3600000, // 2 months in ms
  },
}))

// x-response-time
app.use(async(ctx, next) => {
  debug('x-response-time begin')
  const start = new Date()
  await next()
  const ms = new Date() - start
  ctx.set('X-Response-Time', `${ms}ms`)
  debug('x-response-time end')
})

app.use(bodyParser())

app.use(router.routes())
  .use(router.allowedMethods())

app.on('error', err =>
  process.stderr.write(`server error ${err}\n`)
)

app.listen(3000)
