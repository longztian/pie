export default `
type User {
  id: Int! # the ! means that every author object _must_ have an id
  username: String
  avatar: String
  wechat: String
  firstName: String
  lastName: String
  lastAccessTime: Int
  lastAccessCity: String
  posts: [ForumTopic] # the list of ForumTopics by this author
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
  attachments: [Image]
}

type YellowPage {
  id: Int!
  title: String
  author: User
  body: String
  attachments: [Image]
}

# the schema allows the following query:
type Query {
  latestForumTopics: [ForumTopic]
  latestYellowPages: [YellowPage]
  latestForumTopicReplies: [ForumTopic]
  latestYellowPageReplies: [YellowPage]

  posts: [ForumTopic]
}

# this schema allows the following mutation:
type Mutation {
  updateForumTopic(postId: Int!): ForumTopic
  deleteUser(userId: Int!): User
}

# we need to tell the server which types represent the root query
# and root mutation types. We call them RootQuery and RootMutation by convention.
schema {
  query: Query
  mutation: Mutation
}
`
