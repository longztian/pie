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

const create = (tid, author, toUid, body) => {
  const timestamp = Math.floor(Date.now() / 1000)

  if (tid > 0) {
    return query('INSERT INTO priv_msgs (msg_id, from_uid, to_uid, body, time) VALUES (?, ?, ?, ?, ?)',
      [tid, author.id, toUid, body, timestamp])
    .then(results => ({
      id: results.insertId,
      author,
      body,
      createTime: timestamp,
    }))
  } else {
    return query('INSERT INTO priv_msgs (from_uid, to_uid, body, time) VALUES (?, ?, ?, ?)',
      [author.id, toUid, body, timestamp])
    .then(results => {
      return query('UPDATE priv_msgs SET msg_id = id WHERE id = ?', [results.insertId])
      .then(() => ({
        id: results.insertId,
        author,
        body,
        createTime: timestamp,
      }))
    })
  }

}

const deleteMsg = id => query('DELETE FROM privmsgs WHERE id = ?', [id])
  .then(() => true)

export default {
  create,
  delete: deleteMsg,
}
