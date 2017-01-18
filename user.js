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
  const dbFields = fields.filter(field => columns[field])
  if (dbFields.length === 0 || (dbFields.length === 1 && dbFields[0] === 'id')) {
    return { id }
  }

  const selections = dbFields
    .map(field => (field === columns[field] ? field : `${columns[field]} AS ${field}`))
    .join(', ')

  return query(`SELECT ${selections} FROM users WHERE id = ?`, [id])
  .then(result => (result.length > 0 ? result[0] : null))
}

const getSqlKeyValues = (data) => {
  const fields = Object.keys(data)
  if (fields.length === 0) return Promise.reject('Error: no data to update')

  const dbFields = fields.filter(field => columns[field])
  if (fields.length !== dbFields.length) return Promise.reject('Internal Error: unknown DB field')

  return Promise.resolve({
    keys: dbFields.map(field => `${field}=?`).join(', '),
    values: Object.values(data),
  })
}

const create = data => getSqlKeyValues(data)
  .then(({ keys, values }) => query(`INSERT users SET ${keys}`, values))
  .then(result => result.insert_id())

const update = (id, data) => {
  if (data.password) data.password = hash(data.password)

  return getSqlKeyValues(data)
    .then(({ keys, values }) => query(`UPDATE users SET ${keys} WHERE id = ${id}`, values))
    .then(() => id)
}

const deleteUser = id => query('DELETE FROM users WHERE id = ?', [id]).then(() => id)

export default {
  get,
  create,
  update,
  delete: deleteUser,
}
