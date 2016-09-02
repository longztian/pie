const Router = require('koa-router')
const debug = require('debug')('pie')

const router = new Router()

router.get('/user/:id', (ctx) => {
  debug('router /user')
  ctx.session.uid = ctx.params.id
  ctx.body = `get user ${ctx.params.id}`
})

router.get('/node', (ctx) => {
  debug('router /node')
  ctx.body = '/node'
})

router.all('*', (ctx) => {
  debug('router *')
  ctx.status = 404
  ctx.body = {
    code: ctx.status,
    data: {
      error: 'Endpoint not found',
    },
  }
})

module.exports = router
