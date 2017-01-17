import query from './db/query'

const get = id => query('SELECT id, username AS name, avatar, sex, wechat, website, favorite_quotation AS info, create_time AS createTime, last_access_time AS lastAccessTime, last_access_ip AS lastAccessCity, points FROM users WHERE id = ?', [id])
  .then(result => (result.length > 0 ? result[0] : null))

const update = (id, data) => {
  console.log('updating user', data)
  var sql = 'UPDATE users SET'
  var values = []
  for (const key in data) {
    sql += ' ' + key + '=?,'
    values.push(data[key])
  }
  sql = sql.slice(0, -1) + ' WHERE id = ' + id
  return query(sql, values).then(result => id)
}

export default {
  get,
  update,
}
