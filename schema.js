import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql'
import convert from 'koa-convert'
import graphqlHTTP from 'koa-graphql'

// Maps id to User object
const fakeDatabase = {
  'a': {
    id: 'a',
    username: 'alice',
  },
  'b': {
    id: 'b',
    username: 'bob',
  },
};

// Define the User type
const User = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {
      type: GraphQLString,
      //resolve: id => id,
    },
    username: {
      type: GraphQLString,
      //resolve: username => username,
    },
  }
})

// Define the Query type
const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    viewer: {
      type: User,
      // `args` describes the arguments that the `user` query accepts
      args: {
        id: {
          type: GraphQLString
        },
      },
      resolve: (_, {id}) => {
        console.log(_, id);
        return fakeDatabase[id]
      },
    },
  },
});

const addUser = {
  type: User,
  args: {
    id: {
      type: GraphQLString,
    },
    username: {
      type: GraphQLString,
    },
  },
  resolve: (_, {id, username}) => {
    console.log(_, id, username)
    fakeDatabase[id] = {id, username}
    return fakeDatabase[id]
  }
}

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: addUser,
  },
});


const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
})

export default convert(graphqlHTTP({
  schema: schema,
  graphiql: true,
}))


/* client side
UPDATE:

mutation {
  addUser(id: "d", username: "ddddd") {
    id,
    username
  }
}


QUERY:

{
  viewer(id: "d") {
    id,
    username
  }
}

*/
