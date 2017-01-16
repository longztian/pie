import query from './db/query'

const get = id => query('SELECT id, username AS name, avatar, wechat, website, favorite_quotation AS info, create_time AS createTime, last_access_time AS lastAccessTime, last_access_ip AS lastAccessCity, points FROM users WHERE id = ?', [id])
  .then(result => (result.length > 0 ? result[0] : null))

export default {
  get,
}
