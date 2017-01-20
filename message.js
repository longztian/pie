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

const create = (tid, uid, toUid, body) => {}

const deleteMsg = id => query('DELETE FROM privmsgs WHERE id = ?', [id])
  .then(() => true)

export default {
  create,
  delete: deleteMsg,
}
