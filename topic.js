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

const toTopic = results => ({
  id: results.msg_id,
  title: results.body.length > 22 ? `${results.body.slice(0, 20)}...` : results.body,
  hasNewMessage: results.is_new === 1,
  changeTime: results.time,
  attendee: {
    id: results.uid,
    name: results.user,
  },
})

const toMessage = data => ({
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
    .then(results => results[0].map(toTopic))
}

const getPMTopic = (uid, tid) => {
  const topic = {
    id: tid,
  }

  return query('CALL get_pm(?, ?)', [tid, uid])
    .then((results) => {
      topic.messages = results[0].map(toMessage)
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

  getUserRecentCreatedTopics,
  getUserRecentRepliedTopics,

  getPMTopics,
  getPMTopic,
  countNewPMTopics,
}
