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
  .then(result => result[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.create_time,
  })))

const getRecentCreatedYellowPages = limit => tag.getYellowPageTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_tag_recent_nodes_yp(?, ?)', [ids, limit]))
  .then(result => result[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.exp_time,
  })))

const getRecentCreatedActivities = limit => query('CALL get_recent_activities(?, ?)',
  [0, limit])
  .then(result => result[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.start_time,
  })))

const getRecentRepliedForumTopics = limit => tag.getForumTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_tag_recent_comments(?, ?)', [ids, limit]))
  .then(result => result[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.comment_count,
  })))

const getRecentRepliedYellowPages = limit => tag.getYellowPageTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_tag_recent_comments_yp(?, ?)', [ids, limit]))
  .then(result => result[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.comment_count,
  })))

const getRecentHotForumTopics = (startTime, limit) => tag.getForumTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_tag_hot_nodes(?, ?, ?)', [ids, startTime, limit]))
  .then(result => result[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
  })))

const getUserRecentCreatedTopics = (uid, limit) => tag.getForumTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_user_recent_nodes(?, ?, ?)', [ids, uid, limit]))
  .then(result => result[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.create_time,
  })))

const getUserRecentRepliedTopics = (uid, limit) => tag.getForumTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_user_recent_comments(?, ?, ?)', [ids, uid, limit]))
  .then(result => result[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.create_time,
  })))

const getPrivateMessageTopics = (ctx, limit, offset) => {

}

export default {
  getRecentCreatedForumTopics,
  getRecentCreatedYellowPages,
  getRecentRepliedForumTopics,
  getRecentRepliedYellowPages,
  getRecentCreatedActivities,
  getRecentHotForumTopics,

  getUserRecentCreatedTopics,
  getUserRecentRepliedTopics,
}
