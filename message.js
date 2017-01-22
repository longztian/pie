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

const create = (tid, fromUid, toUid, body) => {
  const timestamp = Math.floor(Date.now() / 1000)

  let dbAction
  if (tid > 0) {
    dbAction = query('INSERT INTO priv_msgs (msg_id, from_uid, to_uid, body, time) VALUES (?, ?, ?, ?, ?)',
                     [tid, fromUid, toUid, body, timestamp])
  } else {
    dbAction = query('INSERT INTO priv_msgs (from_uid, to_uid, body, time) VALUES (?, ?, ?, ?)',
                     [fromUid, toUid, body, timestamp])
               .then(results => query('UPDATE priv_msgs SET msg_id = id WHERE id = ?', [results.insertId])
                                .then(() => results))
  }

  return dbAction.then(results => ({
    id: results.insertId,
    createTime: timestamp,
  }))
}

const deleteMsg = (mid, uid) => query('CALL delete_pm(?, ?)', [mid, uid])
                                .then(() => true)

const getForumMessages = (topicId, limit, offset, fields) => {
  console.log(topicId, limit, offset, fields)
  return [{
    id: 1,
    body: 'test',
    author: {
      id: 1,
    }
  }]
}

export default {
  create,
  delete: deleteMsg,

  getForumMessages,
}
