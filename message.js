import query from './db/query'
import image from './image'
import { toInsertColumnValues } from './db/toColumnValue'

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
const timestamp = () => Math.floor(Date.now() / 1000)

const pmFieldColumMap = {
  topicId: 'msg_id',
  userId: 'from_uid',
  toUserId: 'to_uid',
  body: 'body',
  createTime: 'time',
}

const createPrivateMessage = (userId, topicId, toUserId, body) => {
  const createTime = timestamp()
  const data = {
    userId,
    toUserId,
    body,
    createTime,
  }
  if (topicId) data.topicId = topicId

  const { columns, values } = toInsertColumnValues(data, pmFieldColumMap)

  let action = query(`INSERT INTO priv_msgs ${columns}`, values)
  if (!topicId) {
    action = action.then(results =>
      query('UPDATE priv_msgs SET msg_id = id WHERE id = ?', [results.insertId])
      .then(() => results))
  }

  return action.then(results => ({
    id: results.insertId,
    createTime,
  }))
}

const deletePrivateMessage = (userId, messageId) =>
  query('CALL delete_pm(?, ?)', [messageId, userId])
  .then(() => true)

const fieldColumMap = {
  topicId: 'nid',
  userId: 'uid',
  body: 'body',
  createTime: 'create_time',
}

const createMessage = (userId, topicId, body, images) => {
  const createTime = timestamp()
  const { columns, values } = toInsertColumnValues({
    userId,
    topicId,
    body,
    createTime,
  }, fieldColumMap)

  return query(`INSERT INTO comments ${columns}`, values).then((results) => {
    const messageId = results.insertId
    return Promise.resolve(images ? images.map(i => image.add(messageId, i.name, i.path)) : [])
      .then(imgs => ({
        id: messageId,
        body,
        author: {
          id: userId,
        },
        images: imgs,
        createTime,
      }))
  })
}

const getAuthorUid = messageId =>
  query('SELECT uid FROM comments WHERE id = ?', [messageId])
  .then(results => (results.length > 0 ? results[0].uid : null))

const updateMessage = (userId, messageId, body, images) =>
  getAuthorUid(messageId).then((authorUid) => {
    if (!authorUid) throw new Error('Message not found')
    if (authorUid !== userId) throw new Error('Operation not permitted')

    const actions = images.map((img) => {
      // {id: undefined, name, path} get new image info and insert new images
      // {id: Int!, name} update name for existing images
      // {id: Int!} delete this images
      if (img.id) {
        if (img.name) return image.update(img.id, img.name)
        return image.delete(img.id)
      }
      return image.add(messageId, img.name, img.path)
    })

    if (body) actions.push(query('UPDATE comments SET body = ? WHERE id = ?', [body, messageId]))

    return Promise.all(actions).then(() => true)
  })

const deleteMessage = (userId, messageId) =>
  getAuthorUid(messageId).then((authorUid) => {
    if (!authorUid) throw new Error('Message not found')
    if (authorUid !== userId) throw new Error('Operation not permitted')

    return Promise.all([
      query('DELETE FROM comments WHERE id = ?', [messageId]),
      image.deleteMessageImages(messageId),
    ]).then(() => true)
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
