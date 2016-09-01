const Router = require('koa-router')
const debug = require('debug')('pie')

const router = new Router()

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

module.exports = router
