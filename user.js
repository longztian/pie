import query from './db/query'
import { hash } from './password'

const columns = {
  id: 'id',
  name: 'username',
  email: 'email',
  password: 'password',
  avatar: 'avatar',
  gender: 'sex',
  wechat: 'wechat',
  website: 'website',
  info: 'favorite_quotation',
  createTime: 'create_time',
  lastAccessTime: 'last_access_time',
  lastAccessCity: 'last_access_ip',
  points: 'points',
}

const get = (id, fields) => {
  const selections = fields.filter(field => columns[field])
  .map(field => (field === columns[field] ? field : `${columns[field]} AS ${field}`))
  .join(', ')

  return query(`SELECT ${selections} FROM users WHERE id = ?`, [id])
  .then(result => (result.length > 0 ? result[0] : null))
}

const update = (id, data) => {
  if (data.password) data.password = hash(data.password)

  const keys = Object.keys(data).map(key => `${columns[key]}=?`).join(', ')
  const values = Object.values(data)

  return query(`UPDATE users SET ${keys} WHERE id = ${id}`, values).then(() => id)
}

export default {
  get,
  update,
}
