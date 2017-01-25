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
  .then(results => (results.length > 0 ? results[0] : null))
}

const getSqlKeyValues = (data, columns) => {
  const fields = Object.keys(data)
  if (fields.length === 0) throw new Error('Error: no data to update')

  const dbFields = fields.filter(field => columns[field])
  if (fields.length !== dbFields.length) throw new Error('Internal Error: unknown DB field')

  return {
    keys: dbFields.map(field => columns[field]),
    values: dbFields.map(field => data[field]),
  }
}

const create = (data) => {
  if (data.password) data.password = hash(data.password)

  const { keys, values } = getSqlKeyValues(data, columns)
  const cols = keys.join(',')
  const vals = keys.map(() => '?').join(',')
  return query(`INSERT INTO users (${cols}) VALUES (${vals})`, values)
    .then(results => results.insertId)
}

const update = (id, data) => {
  if (data.password) data.password = hash(data.password)

  const { keys, values } = getSqlKeyValues(data, columns)
  const cols = keys.map(field => `${field}=?`).join(', ')
  return query(`UPDATE users SET ${cols} WHERE id = ${id}`, values)
    .then(() => id)
}

const deleteUser = id => query('DELETE FROM users WHERE id = ?', [id]).then(() => id)

export default {
  get,
  create,
  update,
  delete: deleteUser,
}
