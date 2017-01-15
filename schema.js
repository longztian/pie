import { makeExecutableSchema } from 'graphql-tools'
import resolver from './schema-resolver'

const schema = `
type User {
  id: Int!
  username: String
  avatar: String
  wechat: String
  firstName: String
  lastName: String
  lastAccessTime: Int
  lastAccessCity: String
  posts: [ForumTopic]
}

input UserInput {
  username: String
  password: String
}

type Image {
  name: String
  path: String
  width: Int
  height: Int
}

type ForumTopic {
  id: Int!
  title: String
  author: User
  body: String
  time: Int
  attachments: [Image]
}

type YellowPage {
  id: Int!
  title: String
  author: User
  body: String
  attachments: [Image]
}

type Query {
  latestForumTopics(limit: Int = 10): [ForumTopic]
  latestYellowPages: [YellowPage]
  latestForumTopicReplies: [ForumTopic]
  latestYellowPageReplies: [YellowPage]
}

type Authentication {
  uid: Int
  username: String
  role: [String]
}

type Mutation {
  login(username: String, password: String): Authentication
  logout: Authentication
  updateForumTopic(postId: Int!): ForumTopic
  deleteUser(userId: Int!): User
}

schema {
  query: Query
  mutation: Mutation
}
`

const jsSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: resolver,
  logger: console,
})

export default jsSchema
