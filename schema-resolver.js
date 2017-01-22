import auth from './authentication'
import topic from './topic'
import user from './user'
import message from './message'

const twoWeeksAgo = () => Math.floor(Date.now() / 86400000 - 7 * 2) * 86400

const fields = info => info.fieldNodes[0].selectionSet.selections
  .map(selection => selection.name.value)

export default {
  User: {
    lastAccessCity: () => 'Houston, TX',
    recentCreatedTopics: (obj, { limit }) => topic.getUserRecentCreatedTopics(obj.id, limit),
    recentRepliedTopics: (obj, { limit }) => topic.getUserRecentRepliedTopics(obj.id, limit),
  },

  Message: {
    author: (obj, args, ctx, info) => user.get(obj.author.id, fields(info))
  },

  ForumTopic: {
    messages: (obj, { limit, offset }, ctx, info) => message.getForumMessages(obj.id, limit, offset, fields(info)),
  },

  YellowPageTopic: {
    messages: (obj, { limit, offset }) => message.getYellowPageMessages(obj.id, limit, offset),
  },

  PrivMsgTopic: {
    messages: (obj, { limit, offset }) => message.getPrivateMessages(obj.id, limit, offset),
  },

  Query: {
    recentCreatedForumTopics: (obj, { limit }) => topic.getRecentCreatedForumTopics(limit),
    recentCreatedYellowPages: (obj, { limit }) => topic.getRecentCreatedYellowPages(limit),
    recentCreatedActivities: (obj, { limit }) => topic.getRecentCreatedActivities(limit),
    recentRepliedForumTopics: (obj, { limit }) => topic.getRecentRepliedForumTopics(limit),
    recentRepliedYellowPages: (obj, { limit }) => topic.getRecentRepliedYellowPages(limit),
    recentHotForumTopics: (obj, { limit }) => topic.getRecentHotForumTopics(twoWeeksAgo(), limit),

    bookmarkedTopics: (obj, { limit, offset }, ctx) => {
      if (auth.isAuthenticated(ctx)) {
        return topic.getUserBookmarkedTopcis(auth.getUser(ctx).id, limit, offset)
      }
      return null
    },

    user: (obj, { id }, ctx, info) => (auth.isAuthenticated(ctx) ? user.get(id, fields(info))
                                                                 : null),

    forumTopics: (obj, { tagId, limit, offset }) => topic.getForumTopics(tagId, limit, offset),
    forumTopic: (obj, { id }) => topic.getForumTopic(id),

    ypTopics: (obj, { tagId, limit, offset }) => topic.getYellowPageTopics(tagId, limit, offset),
    ypTopic: (obj, { id }) => topic.getYellowPageTopic(id),

    pmCountNew: (obj, args, ctx) => {
      if (auth.isAuthenticated(ctx)) {
        return topic.countNewPMTopics(auth.getUser(ctx).id)
      }
      return null
    },

    pmTopics: (obj, { mailbox, limit, offset }, ctx) => {
      if (auth.isAuthenticated(ctx)) {
        return topic.getPMTopics(auth.getUser(ctx).id, mailbox, limit, offset)
      }
      return null
    },

    pmTopic: (obj, { id }, ctx) => {
      if (auth.isAuthenticated(ctx)) {
        return topic.getPMTopic(auth.getUser(ctx).id, id)
      }
      return null
    },
  },

  Mutation: {
    login: (obj, { email, password }, ctx) => auth.login(ctx, email, password),
    logout: (obj, args, ctx) => auth.logout(ctx),

    createUser: (obj, { data }, ctx, info) => (auth.isTempIdentified(ctx)
      ? user.create(data).then(uid => user.get(uid, fields(info)))
      : null),
    updateUser: (obj, { id, data }, ctx, info) => (auth.isSelf(ctx, id)
      ? user.update(id, data).then(uid => user.get(uid, fields(info)))
      : null),
    deleteUser: (obj, { id }, ctx) => (auth.isAdmin(ctx) && !auth.isSelf(ctx, id)
      ? user.delete(id).then(() => true)
      : false),

    createPrivateMessage: (obj, { topicId, toUserId, body }, ctx) => {
      if (auth.isAuthenticated(ctx) && !auth.isSelf(ctx, toUserId)) {
        const author = auth.getUser(ctx)
        return message.create(topicId, author.id, toUserId, body)
          .then(msg => ({
            ...msg,
            author,
            body,
          }))
      }
      return null
    },
    deletePrivateMessage: (obj, { id }, ctx) => (auth.isAuthenticated(ctx)
      ? message.delete(id, auth.getUser(ctx).id)
      : false),
    deletePrivateMessages: (obj, { ids }, ctx) => {
      if (auth.isAuthenticated(ctx)) {
        const uid = auth.getUser(ctx).id
        return ids.map(mid => message.delete(mid, uid))
      }
      return null
    },

    createBookmark: (obj, { topicId }, ctx) => {
      if (auth.isAuthenticated(ctx)) {
        return topic.createUserBookmark(auth.getUser(ctx).id, topicId)
      }
      return null
    },
    deleteBookmark: (obj, { topicId }, ctx) => {
      if (auth.isAuthenticated(ctx)) {
        return topic.deleteUserBookmark(auth.getUser(ctx).id, topicId)
      }
      return null
    },
    deleteBookmarks: (obj, { topicIds }, ctx) => {
      if (auth.isAuthenticated(ctx)) {
        const uid = auth.getUser(ctx).id
        return topicIds.map(tid => topic.deleteUserBookmark(uid, tid))
      }
      return null
    }
  },
}
