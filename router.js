const Router = require('koa-router')
const debug = require('debug')('pie')

const router = new Router()

router.get('/user', (ctx, next) => {
  debug('router /user')
  ctx.body = '/user'
  return next().then(() => {

  })
})

router.get('/node', (ctx, next) => {
  debug('router /node')
  ctx.body = '/node'
  return next()
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
  return next()
})

module.exports = router
