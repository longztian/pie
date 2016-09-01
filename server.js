const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const debug = require('debug')('pie')
const router = require('./router')

const app = new Koa()

// ALLOW PROXY REQUESTS
app.proxy = true

app.use(logger())

// x-response-time
app.use(async (ctx, next) => {
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

app.use(() => {
  debug('finally')
})

app.listen(3000)

app.on('error', err =>
  process.stderr.write(`server error ${err}\n`)
)
