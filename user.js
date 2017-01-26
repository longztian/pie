import query from './db/query'
import {
  toSelectColumns,
  toInsertColumnValues,
  toUpdateColumnValues,
} from './db/toColumnValue'
import { hash } from './password'

const fieldColumnMap = {
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
  if (fields.length === 1 && fields[0] === 'id') return { id }

  const columns = toSelectColumns(fields, fieldColumnMap)
  return query(`SELECT ${columns} FROM users WHERE id = ?`, [id])
    .then(results => (results.length > 0 ? results[0] : null))
}

const create = (data) => {
  if (data.password) data.password = hash(data.password)

  const { columns, values } = toInsertColumnValues(data, fieldColumnMap)
  return query(`INSERT INTO users ${columns}`, values)
    .then(results => results.insertId)
}

const update = (id, data) => {
  if (data.password) data.password = hash(data.password)

  const { columns, values } = toUpdateColumnValues(data, fieldColumnMap)
  return query(`UPDATE users SET ${columns} WHERE id = ${id}`, values)
    .then(() => id)
}

const deleteUser = id => query('DELETE FROM users WHERE id = ?', [id]).then(() => id)

export default {
  get,
  create,
  update,
  delete: deleteUser,
}
