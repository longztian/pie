const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')
const logger = require('koa-logger')
const debug = require('debug')('pie')


const app = new Koa()
const router = new Router()

// ALLOW PROXY REQUESTS
app.proxy = true

router.get('/user', (ctx, next) => {
  ctx.body = '/user'
  next()
})

router.get('/node', (ctx, next) => {
  debug('router /node')
  ctx.body = '/node'
  next()
})

router.all('*', (ctx, next) => {
  debug('router *')
  ctx.status = 404
  ctx.body = {
    code: ctx.status,
    data: {
      error: 'Endpoint not found',
    },
  }
  next()
    // return ctx.body
})

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
