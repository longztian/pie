import auth from './authentication'
import topic from './topic'

const getPosts = uid => [{
  id: 1,
  authorId: uid,
}]

const getUser = uid => ({
  id: uid,
  username: 'ikki',
})

export default {
  User: {
    posts: obj => getPosts(obj.id),
  },

  Query: {
    latestForumTopics: (obj, { limit }) => topic.getLatestForumTopics(limit),
    latestYellowPages: (obj, { limit }) => topic.getLatestYellowPages(limit),
  },

  Mutation: {
    login: (obj, { username, password }, ctx) => auth.login(ctx, username, password),
    logout: (obj, args, ctx) => auth.logout(ctx),
  },
}
