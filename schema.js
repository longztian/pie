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

type Image {
  id: Int!,
  name: String,
  path: String,
  height: Int,
  width: Int
}

type Message {
  id: Int!
  body: String
  author: User
  createTime: Int
  images: [Image]
}

type ForumTopic {
  id: Int!
  title: String
  messageCount: Int
  messages(limit: Int = 10, offset: Int = 0): [Message]
}

type YellowPageTopic {
  id: Int!
  name: String
  address: String
  phone: String
  email: String
  website: String
  messageCount: Int
  messages(limit: Int = 10, offset: Int = 0): [Message]
}

type PrivMsgTopic {
  id: Int!
  title: String
  changeTime: Int
  hasNewMessage: Boolean
  attendee: User
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

  bookmarkedTopics(limit: Int = 10, offset: Int = 0): [TopicInfo]

  user(id: Int!): User

  forumTopics(tagId: Int!, limit: Int = 10, offset: Int = 0): [ForumTopic]
  forumTopic(id: Int!): ForumTopic

  ypTopics(tagId: Int!, limit: Int = 10, offset: Int = 0): [YellowPageTopic]
  ypTopic(id: Int!): YellowPageTopic

  pmCountNew: Int
  pmTopics(mailbox: Mailbox = INBOX, limit: Int = 10, offset: Int = 0): [PrivMsgTopic]
  pmTopic(id: Int!): PrivMsgTopic
}

type Authentication {
  user: User
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
  login(email: String!, password: String!): Authentication
  logout: Authentication

  createUser(data: UserInput!): User
  updateUser(id: Int!, data: UserInput!): User
  deleteUser(id: Int!): Boolean
  deleteUsers(ids: [Int!]!): [Boolean]

  createForumTopic(title: String!, body: String!, files: [Int!]): ForumTopic
  deleteForumTopic(id: Int!): Boolean

  createYellowPage(name: String!, body: String!, files: [Int!]): YellowPageTopic
  deleteYellowPage(id: Int!): Boolean

  createMessage(topicId: Int!, body: String!, files: [Int!]): Message
  deleteMessage(id: Int!): Boolean

  createPrivateMessage(topicId: Int = 0, toUserId: Int!, body: String!): Message
  deletePrivateMessage(id: Int!): Boolean
  deletePrivateMessages(ids: [Int!]!): [Boolean]

  createBookmark(topicId: Int!): Boolean
  deleteBookmark(topicId: Int!): Boolean
  deleteBookmarks(topicIds: [Int!]!): [Boolean]
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
