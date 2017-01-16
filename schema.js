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

type Query {
  recentCreatedForumTopics(limit: Int = 10): [TopicInfo]
  recentCreatedYellowPages(limit: Int = 10): [TopicInfo]
  recentCreatedActivities(limit: Int = 10): [TopicInfo]
  recentRepliedForumTopics(limit: Int = 10): [TopicInfo]
  recentRepliedYellowPages(limit: Int = 10): [TopicInfo]
  recentHotForumTopics(limit: Int = 10): [TopicInfo]

  user(id: Int): User
}

type Authentication {
  uid: Int
  name: String
  role: [String]
}

type Mutation {
  login(email: String, password: String): Authentication
  logout: Authentication
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
