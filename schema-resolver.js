import auth from './authentication'
import topic from './topic'
import user from './user'

const twoWeeksAgo = () => Math.floor(Date.now() / 86400000 - 7 * 2) * 86400

const fields = info => info.fieldNodes[0].selectionSet.selections
  .map(selection => selection.name.value)

export default {
  User: {
    lastAccessCity: () => 'Houston, TX',
    recentCreatedTopics: (obj, { limit }) => topic.getUserRecentCreatedTopics(obj.id, limit),
    recentRepliedTopics: (obj, { limit }) => topic.getUserRecentRepliedTopics(obj.id, limit),
  },

  Query: {
    recentCreatedForumTopics: (obj, { limit }) => topic.getRecentCreatedForumTopics(limit),
    recentCreatedYellowPages: (obj, { limit }) => topic.getRecentCreatedYellowPages(limit),
    recentCreatedActivities: (obj, { limit }) => topic.getRecentCreatedActivities(limit),
    recentRepliedForumTopics: (obj, { limit }) => topic.getRecentRepliedForumTopics(limit),
    recentRepliedYellowPages: (obj, { limit }) => topic.getRecentRepliedYellowPages(limit),
    recentHotForumTopics: (obj, { limit }) => topic.getRecentHotForumTopics(twoWeeksAgo(), limit),

    user: (obj, { id }, ctx, info) => (auth.isAuthenticated(ctx) ? user.get(id, fields(info))
                                                                 : null),
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
    deleteUser: (obj, { id }, ctx, info) => (auth.isAdmin(ctx) && !auth.isSelf(ctx, id)
      ? user.delete(id).then(uid => user.get(uid, fields(info)))
      : null),
  },
}
