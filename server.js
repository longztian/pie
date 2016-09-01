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

app.use((ctx, next) => {
  const start = new Date()
  return next().then(() => {
    const ms = new Date() - start
    ctx.set('X-Response-Time', `${ms}ms`)
  })
})

app.use(bodyParser())

// logger
app.use((ctx, next) => {
  const start = new Date()
  return next().then(() => {
    const ms = new Date() - start
    process.stdout.write(`${ctx.method} ${ctx.url} - ${ms}ms\n`)
  })
})

// response
app.use((ctx, next) => {
  ctx.body = 'Hello World'
  return next()
})

app.use(router.routes())
  .use(router.allowedMethods())

app.use(() => {
  debug('finally')
})

app.listen(3000)

/*
 * log errors to file
app.on('error', err =>
  //log.error('server error', err)
)
*/
