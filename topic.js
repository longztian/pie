import query from './db/query'
import tag from './tag'

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

const getLatestForumTopics = limit => tag.getForumTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_tag_recent_nodes(?, ?)', [ids, limit]))
  .then(result => result[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.create_time,
  })))

const getLatestYellowPages = limit => tag.getForumTags()
  .then(ids => ids.join(','))
  .then(ids => query('CALL get_tag_recent_nodes(?, ?)', [ids, limit]))
  .then(result => result[0].map(topic => ({
    id: topic.nid,
    title: topic.title,
    info: topic.create_time,
  })))

const getLatestActivities = (limit) => {

}

const getPrivateMessageTopics = (ctx, limit, offset) => {

}

export default {
  getLatestForumTopics,
  getLatestYellowPages,
}
