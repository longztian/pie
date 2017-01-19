import { makeExecutableSchema } from 'graphql-tools'
import resolver from './schema-resolver'

const schema = `

type TopicInfo {
  id: Int!
  title: String
  info: Int
}

type User {
  id: Int!
  name: String
  avatar: String
  gender: Int
  wechat: String
  website: String
  info: String
  createTime: Int
  lastAccessTime: Int
  lastAccessCity: String
  points: Int
  recentCreatedTopics(limit: Int = 10): [TopicInfo]
  recentRepliedTopics(limit: Int = 10): [TopicInfo]
}

type Message {
  id: Int!
  body: String
  author: User
  createTime: Int
}

type Topic {
  id: Int!
  title: String
  msgCount: Int
  messages: [Message]
}

enum Mailbox {
  INBOX
  SENT
}

type Query {
  recentCreatedForumTopics(limit: Int = 10): [TopicInfo]
  recentCreatedYellowPages(limit: Int = 10): [TopicInfo]
  recentCreatedActivities(limit: Int = 10): [TopicInfo]
  recentRepliedForumTopics(limit: Int = 10): [TopicInfo]
  recentRepliedYellowPages(limit: Int = 10): [TopicInfo]
  recentHotForumTopics(limit: Int = 10): [TopicInfo]

  user(id: Int): User

  getNewMessageCount(uid: Int): Int
  getMessageTopics(userId: Int, mailbox: Mailbox, limit: Int = 10, offset: Int = 0): [Topic]
  getMessages(topicId: Int, userId: Int): [Message]
}

type Authentication {
  uid: Int
  name: String
  role: [String]
}

input UserInput {
  name: String
  email: String
  password: String
  avatar: String
  gender: Int
  wechat: String
  website: String
  info: String
}

type Mutation {
  login(email: String, password: String): Authentication
  logout: Authentication

  createUser(data: UserInput): User
  updateUser(id: Int, data: UserInput): User
  deleteUser(id: Int): Boolean
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
