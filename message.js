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

const createPrivateMessage = (userId, topicId, toUserId, body) => {
  const timestamp = Math.floor(Date.now() / 1000)

  let action
  if (topicId > 0) {
    action = query('INSERT INTO priv_msgs (msg_id, from_uid, to_uid, body, time) VALUES (?, ?, ?, ?, ?)',
                    [topicId, userId, toUserId, body, timestamp])
  } else {
    action = query('INSERT INTO priv_msgs (from_uid, to_uid, body, time) VALUES (?, ?, ?, ?)',
                    [userId, toUserId, body, timestamp])
                .then(results => query('UPDATE priv_msgs SET msg_id = id WHERE id = ?', [results.insertId])
                                .then(() => results))
  }

  return action.then(results => ({
    id: results.insertId,
    createTime: timestamp,
  }))
}

const deletePrivateMessage = (userId, messageId) =>
  query('CALL delete_pm(?, ?)', [messageId, userId])
  .then(() => true)

const createMessage = (userId, topicId, body, images) => {
  const timestamp = Math.floor(Date.now() / 1000)
  return query('INSERT INTO comments (uid, nid, body, create_time) VALUES (?, ?, ?, ?)',
                [userId, topicId, body, timestamp])
    .then((results) => {
      const messageId = results.insertId
      let action
      if (images && images.length > 0) {
        // get file info: height, width
        // move from tmp to final location
        // insert into database
        action = query(`UPDATE images SET tid = ?, cid = ? WHERE id IN (${images.join(',')})`, [topicId, messageId])

      } else {
        action = Promise.resolve()
      }

      return action.then(() => ({
        id: messageId,
        body,
        author: {
          id: userId,
        },
        createTime: timestamp,
      }))
    })
}

const updateMessage = (userId, messageId, body, images) => {
  // check user ownership
  let action
  if (body) {
    action = query('UPDATE commnets SET body = ? WHERE id = ?', [body, messageId])
  } else {
    action = Promise.resolve()
  }

  if (images && images.length > 0) {
    // has image updates
    // {id: undefined, name, path} get new image info and insert new images
    // {id: Int!, name} update name for existing images
    // {id: Int!} delete this images
  }
}

const deleteMessage = (userId, messageId) =>
  query('SELECT uid FROM comments WHERE id = ?', [messageId])
    .then((results) => {
      if (results.length === 0) return true
      if (results[0].uid !== userId) throw new Error('Not permitted')
      return query('DELETE FROM comments WHERE id = ?', [messageId]).then(() => true)
    })

const toMessage = row => ({
  id: row.id,
  body: row.body,
  createTime: row.create_time,
  author: { id: row.uid },
})

const getMessages = (topicId, limit, offset) =>
  query('SELECT id, body, uid, create_time FROM comments WHERE nid = ? LIMIT ? OFFSET ?', [topicId, limit, offset])
  .then(results => results.map(toMessage))

const getImages = messageId => query('SELECT id, name, path, height, width FROM images WHERE nid = ?', [messageId])

export default {
  createPM: createPrivateMessage,
  deletePM: deletePrivateMessage,

  create: createMessage,
  update: updateMessage,
  delete: deleteMessage,

  getMessages,
  getImages,
}
