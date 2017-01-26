import query from './db/query'
import {
  toSelectColumns,
  toInsertColumnValues,
  toUpdateColumnValues,
} from './db/toColumnValue'
import tag from './tag'

/*
class Topic {
  constructor() {
    this.id = 0
    this.userId = 0
    this.tagIds = []
    this.messageIds = []
    this.title = ''
    this.status = 0
  }
}
*/

const getRecentCreatedForumTopics = limit => tag.getForumTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_tag_recent_nodes(?, ?)', [ids, limit]))
  .then(results => results[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.create_time,
  })))

const getRecentCreatedYellowPages = limit => tag.getYellowPageTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_tag_recent_nodes_yp(?, ?)', [ids, limit]))
  .then(results => results[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.exp_time,
  })))

const getRecentCreatedActivities = limit => query('CALL get_recent_activities(?, ?)',
  [0, limit])
  .then(results => results[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.start_time,
  })))

const getRecentRepliedForumTopics = limit => tag.getForumTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_tag_recent_comments(?, ?)', [ids, limit]))
  .then(results => results[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.comment_count,
  })))

const getRecentRepliedYellowPages = limit => tag.getYellowPageTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_tag_recent_comments_yp(?, ?)', [ids, limit]))
  .then(results => results[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.comment_count,
  })))

const getRecentHotForumTopics = (startTime, limit) => tag.getForumTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_tag_hot_nodes(?, ?, ?)', [ids, startTime, limit]))
  .then(results => results[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
  })))

const getUserRecentCreatedTopics = (userId, limit) => tag.getForumTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_user_recent_nodes(?, ?, ?)', [ids, userId, limit]))
  .then(results => results[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.create_time,
  })))

const getUserRecentRepliedTopics = (userId, limit) => tag.getForumTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_user_recent_comments(?, ?, ?)', [ids, userId, limit]))
  .then(results => results[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.create_time,
  })))

const toForumTopic = row => ({
  id: row.id,
  title: row.title,
  weight: row.weight,
  messageCount: row.comment_count + 1,
})

const getForumTopics = (tagId, limit, offset) => tag.getForumTags()
  .then((ids) => {
    if (ids.includes(tagId)) {
      return query('CALL get_tag_nodes_forum(1, ?, ?, ?)', [tagId, limit, offset])
        .then(results => results[0].map(toForumTopic))
    }
    return null
  })
const getForumTopic = id => query('SELECT id, title FROM nodes WHERE id = ? AND status = 1', [id])
  .then(results => (results.length > 0 ? results[0] : null))

const toYellowPage = row => ({
  id: row.id,
  name: row.title,
  address: row.address,
  phone: row.phone,
  email: row.email,
  website: row.website,
  messageCount: row.comment_count + 1,
})

const getYellowPageTopics = (tagId, limit, offset) => tag.getYellowPageTags()
  .then((ids) => {
    if (ids.includes(tagId)) {
      return query('CALL get_tag_nodes_yp(?, ?, ?)', [`${tagId}`, limit, offset])
        .then(results => results[0].map(toYellowPage))
    }
    return null
  })

const ypFieldColumnMap = {
  id: 'id',
  name: 'title',
  address: 'address',
  phone: 'phone',
  email: 'email',
  website: 'website',
  topicId: 'nid',
}

const getYellowPageTopic = (id, fields) => {
  if (fields.length === 1 && fields[0] === 'id') return { id }

  const columns = toSelectColumns(fields, ypFieldColumnMap)
  if (columns.length === 0) throw new Error('No database columns found')

  return query(`SELECT ${columns} FROM nodes AS n JOIN node_yellowpages AS yp ON n.id = yp.nid WHERE n.id = ? AND status = 1`, [id])
    .then(results => (results.length > 0 ? results[0] : null))
}

const topicFieldColumnMap = {
  userId: 'uid',
  tagId: 'tid',
  title: 'title',
  createTime: 'create_time',
  status: 'status',
}

const createForumTopic = (userId, tagId, title) => {
  const timestamp = Math.floor(Date.now() / 1000)
  const { columns, values } = toInsertColumnValues({
    userId,
    tagId,
    title,
    createTime: timestamp,
    status: 1,
  }, topicFieldColumnMap)
  if (columns.length === 0) throw new Error('No database columns found')

  return query(`INSERT INTO nodes ${columns}`, values)
    .then(results => ({
      id: results.insertId,
      title,
    }))
}

const createYellowPage = (userId, tagId, name, address, phone, email, website) => {
  const timestamp = Math.floor(Date.now() / 1000)
  let cv = toInsertColumnValues({
    userId,
    tagId,
    title: name,
    createTime: timestamp,
    status: 1,
  }, topicFieldColumnMap)
  if (cv.columns.length === 0) throw new Error('No database columns found')

  return query(`INSERT INTO nodes ${cv.columns}`, cv.values)
    .then(results => results.insertId)
    .then((topicId) => {
      cv = toInsertColumnValues({
        topicId,
        address,
        phone,
        email,
        website,
      }, ypFieldColumnMap)
      if (cv.columns.length === 0) throw new Error('No database columns found')

      return query(`INSERT INTO node_yellowpages ${cv.columns}`, cv.values)
        .then(() => ({
          id: topicId,
          name,
          address,
          phone,
          email,
          website,
        }))
    })
}

const updateForumTopic = (userId, topicId, tagId, title) => {
  // check user ownership
  const { columns, values } = toUpdateColumnValues({
    tagId,
    title,
  }, topicFieldColumnMap)
  if (columns.length === 0) throw new Error('No database columns found')

  values.push(topicId)
  return query(`UPDATE nodes SET ${columns} WHERE id = ?`, values)
    .then(() => ({
      id: topicId,
      title,
    }))
}
const updateYellowPage = (userId, topicId, tagId, name, address, phone, email, website) => {
  // check user ownership
  let cv = toUpdateColumnValues({
    tagId,
    title: name,
  }, topicFieldColumnMap)

  let action
  if (cv.columns.length === 0) {
    action = Promise.resolve()
  } else {
    cv.values.push(topicId)
    action = query(`UPDATE nodes SET ${cv.columns} WHERE id = ?`, cv.values)
  }

  cv = toUpdateColumnValues({
    address,
    phone,
    email,
    website,
  }, ypFieldColumnMap)

  if (cv.columns.length > 0) {
    cv.values.push(topicId)
    action = action.then(() => query(`UPDATE node_yellowpages SET ${cv.columns} WHERE nid = ?`, cv.values))
  }

  return action.then(() => ({
    id: topicId,
    name,
    address,
    phone,
    email,
    website,
  }))
}

const deleteTopic = (userId, topicId) =>
  query('SELECT uid, status FROM nodes WHERE id = ?', [topicId])
    .then((results) => {
      if (results.length === 0) return true
      if (results[0].uid !== userId) throw new Error('Not permitted')
      if (results[0].status === 0) return true

      return query('UPDATE nodes SET status = 0 WHERE id = ?', [topicId])
    }).then(() => true)

const getUserBookmarkedTopcis = (userId, limit, offset) =>
  query('CALL bookmark_list(?, ?, ?)', [userId, limit, offset])
  .then(results => results[0])

const createUserBookmark = (userId, topicId) =>
  query('CALL bookmark_add(?, ?)', [userId, topicId])
  .then(() => true)

const deleteUserBookmark = (userId, topicId) =>
  query('CALL bookmark_delete(?, ?)', [userId, topicId])
  .then(() => true)

const toPMTopic = results => ({
  id: results.msg_id,
  title: results.body.length > 22 ? `${results.body.slice(0, 20)}...` : results.body,
  hasNewMessage: results.is_new === 1,
  changeTime: results.time,
  attendee: {
    id: results.uid,
    name: results.user,
  },
})

const toPMMessage = data => ({
  id: data.id,
  createTime: data.time,
  body: data.body,
  author: {
    id: data.uid,
    name: data.username,
    avatar: data.avatar,
  },
})

const getPMTopics = (userId, mailbox, limit, offset) => {
  const func = mailbox !== 'SENT' ? 'get_pm_list_inbox_2' : 'get_pm_list_sent_2'
  return query(`CALL ${func}(?, ?, ?)`, [userId, limit, offset])
    .then(results => results[0].map(toPMTopic))
}

const getPMTopic = (userId, topicId) => {
  const topic = {
    id: topicId,
  }

  return query('CALL get_pm(?, ?)', [topicId, userId])
    .then((results) => {
      topic.messages = results[0].map(toPMMessage)
      return query('CALL get_pm_replyto(?, ?)', [topicId, userId])
    }).then((results) => {
      topic.attendee = {
        id: results[0][0].id,
        name: results[0][0].username,
      }
      return topic
    })
}

const countNewPMTopics = userId => query('CALL get_pm_count_new(?)', [userId])
  .then(results => Object.values(results[0][0])[0])

export default {
  getRecentCreatedForumTopics,
  getRecentCreatedYellowPages,
  getRecentRepliedForumTopics,
  getRecentRepliedYellowPages,
  getRecentCreatedActivities,
  getRecentHotForumTopics,

  getForumTopics,
  getForumTopic,
  getYellowPageTopics,
  getYellowPageTopic,

  createForumTopic,
  createYellowPage,
  updateForumTopic,
  updateYellowPage,
  deleteTopic,

  getUserRecentCreatedTopics,
  getUserRecentRepliedTopics,

  getUserBookmarkedTopcis,
  createUserBookmark,
  deleteUserBookmark,

  getPMTopics,
  getPMTopic,
  countNewPMTopics,
}
