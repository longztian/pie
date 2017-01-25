import query from './db/query'

/*
class Message {
  id,
  userId,
  topicId,
  body,
  bodyHash,
  createTime,
  status,
}
*/

const create = (userId, topicId, toUserId, body) => {
  const timestamp = Math.floor(Date.now() / 1000)

  let getData
  if (topicId > 0) {
    getData = query('INSERT INTO priv_msgs (msg_id, from_uid, to_uid, body, time) VALUES (?, ?, ?, ?, ?)',
                    [topicId, userId, toUserId, body, timestamp])
  } else {
    getData = query('INSERT INTO priv_msgs (from_uid, to_uid, body, time) VALUES (?, ?, ?, ?)',
                     [userId, toUserId, body, timestamp])
                .then(results => query('UPDATE priv_msgs SET msg_id = id WHERE id = ?', [results.insertId])
                                .then(() => results))
  }

  return getData.then(results => ({
    id: results.insertId,
    createTime: timestamp,
  }))
}

const deleteMsg = (userId, messageId) => query('CALL delete_pm(?, ?)', [messageId, userId])
                                          .then(() => true)

const message = row => ({
  id: row.id,
  body: row.body,
  createTime: row.create_time,
  author: { id: row.uid },
})

const getMessages = (topicId, limit, offset) =>
  query('SELECT id, body, uid, create_time FROM comments WHERE nid = ? LIMIT ? OFFSET ?', [topicId, limit, offset])
  .then(results => results.map(message))

const getImages = messageId => query('SELECT id, name, path, height, width FROM images WHERE nid = ?', [messageId])

export default {
  create,
  delete: deleteMsg,

  getMessages,
  getImages,
}
