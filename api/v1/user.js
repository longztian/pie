const debug = require('debug')('pie')
const Router = require('koa-router')

const router = new Router()

router.get('/user/:id', (ctx) => {
  debug('router /user')
  ctx.body = `last user id ${ctx.session.uid}, current user id ${ctx.params.id}`
  ctx.session.uid = ctx.params.id
})

router.post('/user', (ctx) => {
  ctx.body = `POST ${ctx.path}`
})

router.put('/user/:id', (ctx) => {
  ctx.body = `PUT ${ctx.path}`
})

router.del('/user/:id', (ctx) => {
  ctx.body = `DELETE ${ctx.path}`
})

module.exports = router
