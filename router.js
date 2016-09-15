const debug = require('debug')('pie')
const Router = require('koa-router')

const router = new Router()

router.get('/user/:id', (ctx) => {
  debug('router /user')
  ctx.body = `last user id ${ctx.session.uid}, current user id ${ctx.params.id}`
  ctx.session.uid = ctx.params.id
})

router.get('/node', (ctx) => {
  debug('router /node')
  ctx.body = '/node'
})

router.get('/count', (ctx) => {
  ctx.session.count = ctx.session.count || 0
  ctx.body = ctx.session.count += 1
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
