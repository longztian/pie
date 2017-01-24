import query from './db/query'
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

const getUserRecentCreatedTopics = (uid, limit) => tag.getForumTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_user_recent_nodes(?, ?, ?)', [ids, uid, limit]))
  .then(results => results[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.create_time,
  })))

const getUserRecentRepliedTopics = (uid, limit) => tag.getForumTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_user_recent_comments(?, ?, ?)', [ids, uid, limit]))
  .then(results => results[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.create_time,
  })))

const forumTopic = row => ({
  id: row.id,
  title: row.title,
  weight: row.weight,
  messageCount: row.comment_count + 1,
})
const getForumTopics = (tagId, limit, offset) => tag.getForumTags()
  .then((ids) => {
    if (ids.includes(tagId)) {
      return query('CALL get_tag_nodes_forum(1, ?, ?, ?)', [tagId, limit, offset])
        .then(results => results[0].map(forumTopic))
    }
    return null
  })
const getForumTopic = id => query('SELECT id, title FROM nodes WHERE id = ? AND status = 1', [id])
  .then(results => results[0])

const ypTopic = row => ({
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
        .then(results => results[0].map(ypTopic))
    }
    return null
  })
const getYellowPageTopic = id =>
  query('SELECT id, title AS name, address, phone, email, website FROM nodes AS n JOIN node_yellowpages AS yp ON n.id = yp.nid WHERE n.id = ? AND status = 1', [id])
  .then(results => results[0])

const createForumTopic: (uid, title) => {}
const createYellowPage: (uid, name, address, phone, email, website) => {}

const deleteTopic: (uid, tid) => {}

const createMessage: (uid, tid, body, images) => {}
const deleteMessage: (uid, mid) => {}

const getUserBookmarkedTopcis = (uid, limit, offset) =>
  query('CALL bookmark_list(?, ?, ?)', [uid, limit, offset])
  .then(results => results[0])

const createUserBookmark = (uid, topicId) =>
  query('CALL bookmark_add(?, ?)', [uid, topicId])
  .then(() => true)

const deleteUserBookmark = (uid, topicId) =>
  query('CALL bookmark_delete(?, ?)', [uid, topicId])
  .then(() => true)

const pmTopic = results => ({
  id: results.msg_id,
  title: results.body.length > 22 ? `${results.body.slice(0, 20)}...` : results.body,
  hasNewMessage: results.is_new === 1,
  changeTime: results.time,
  attendee: {
    id: results.uid,
    name: results.user,
  },
})

const message = data => ({
  id: data.id,
  createTime: data.time,
  body: data.body,
  author: {
    id: data.uid,
    name: data.username,
    avatar: data.avatar,
  },
})

const getPMTopics = (uid, mailbox, limit, offset) => {
  const func = mailbox !== 'SENT' ? 'get_pm_list_inbox_2' : 'get_pm_list_sent_2'
  return query(`CALL ${func}(?, ?, ?)`, [uid, limit, offset])
    .then(results => results[0].map(pmTopic))
}

const getPMTopic = (uid, tid) => {
  const topic = {
    id: tid,
  }

  return query('CALL get_pm(?, ?)', [tid, uid])
    .then((results) => {
      topic.messages = results[0].map(message)
      return query('CALL get_pm_replyto(?, ?)', [tid, uid])
    }).then((results) => {
      topic.attendee = {
        id: results[0][0].id,
        name: results[0][0].username,
      }
      return topic
    })
}

const countNewPMTopics = uid => query('CALL get_pm_count_new(?)', [uid])
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

  getUserRecentCreatedTopics,
  getUserRecentRepliedTopics,

  getUserBookmarkedTopcis,
  createUserBookmark,
  deleteUserBookmark,

  getPMTopics,
  getPMTopic,
  countNewPMTopics,
}
