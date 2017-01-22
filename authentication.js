import query from './db/query'
import { hash } from './password'

class Authentication {
  constructor(user, role) {
    this.user = user
    this.role = role
  }
}

const guest = () => ({
  id: 0,
})

const isAuthenticated = ctx => ctx.session.auth && ctx.session.auth.user.id !== 0

const isSelf = (ctx, uid) => ctx.session.auth && ctx.session.auth.user.id === uid

const isAdmin = ctx => ctx.session.auth && ctx.session.auth.user.id === 1

const isTempIdentified = ctx => true

const getUser = ctx => (ctx.session.auth ? ctx.session.auth.user : guest())

const login = (ctx, email, password) => {
  if (isAuthenticated(ctx)) throw `you have already logged in as ${ctx.session.auth.user.name}`

  return query('SELECT id, username AS name, avatar, password FROM users WHERE email = ?', [email])
  .then((results) => {
    if (results.length === 0) throw `Account does not exist: ${email}`

    const user = results[0]
    if (user.password !== hash(password)) throw 'Wrong password'

    delete user.password

    ctx.sessionHandler.regenerateId()
    ctx.session.auth = new Authentication(user, [])
    return ctx.session.auth
  })
}

const logout = (ctx) => {
  if (!isAuthenticated(ctx)) throw 'You have not logged in yet'

  ctx.session = null
  return new Authentication(guest(), [])
}

export default {
  login,
  logout,
  isAuthenticated,
  isSelf,
  isAdmin,
  isTempIdentified,
  getUser,
}

