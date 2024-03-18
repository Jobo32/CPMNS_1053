const { graphql, buildSchema } = require('graphql')
//import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

//import { graphql, buildSchema} from 'graphql'

//import model from 'model'
const model = require('./model') //Database

let DB

model.getDB().then(db => {DB = db})

//Notifications
const sse  = require('./utils/notifications')
sse.start()


const schema = buildSchema(`
  type Query {
    catastrophe: [Catastrophe]
    getInfoCatastropheById(idCatastrophe: ID!): Catastrophe
  }
  type Catastrophe{
    id: ID
    country: String
    city: String
    province: String
    cities: [String]
    type: TypeCatastrophe
    area: Float
    date: String
  }
  type TypeCatastrophe{
    id: ID
    name: String
    description: String
  }
  type ActionProtocol {
    id: ID
    type: TypeCatastrophe
    description: String
    examplesofcatastrophe: [String]
  }
  type InsuranceCompany{
    id: ID
    type: String
    name: String
    address: String
    email: String
  }
`)


const rootValue = {
    catastrophe: () => DB.objects('Catastrophe'),
/*
     hello: () => "Hello World!",

     users: () => DB.objects('User'),
     
     blogs: () => DB.objects('Blog'),
     
     searchBlog: ({ q }) => {
       q = q.toLowerCase()
       return DB.objects('Blog').filter(x => x.title.toLowerCase().includes(q))
     },
     
     posts: ({ blogId }) => {
       return DB.objects('Post').filter(x => x.blog.title == blogId)
     },
     
     addPost: ({title, content, authorId, blogId}) => {

       let post = null
       let blog = DB.objectForPrimaryKey('Blog', blogId)
       let auth = DB.objectForPrimaryKey('User', authorId)
       
       if (blog && auth){
          let data = {
                       title: title,
                       content: content,
                       author: auth,
                       blog: blog,
                       timestamp: new Date()
                      }

          DB.write( () => { post = DB.create('Post', data) }) 

          // SSE notification
          sse.emitter.emit('new-post', data)
       }

       return post
     },

     addUser: ({ name }) => {
      let newUser = null
  
      let data = {
          name: name,
          passwd: 'XXX'
      }
  
      DB.write( () => { newUser = DB.create('User', data) })

      sse.emitter.emit('new-user', data)
  
      return data
    },

    searchPost: ({ blogTitle}) => {
      const blog = DB.objects('Blog').find(blog => blog.title === blogTitle);

      if (!blog) {
          throw new Error('Blog no encontrado');
      }

      const posts = DB.objects('Post').filter(post => {
          return post.blog === blog && post.title.toLowerCase().includes(q.toLowerCase());
      });

      return posts;
    }, */
    getInfoCatastropheById: ({ idCatastrophe }) => {
      const catastrophe = DB.objectForPrimaryKey('Catastrophe', idCatastrophe)
      // Verifica si se encontró la catástrofe
      if (!catastrophe) {
          throw new Error('Catástrofe no encontrada');
      }
      console.log(catastrophe)
      // Devuelve la información de la catástrofe encontrada
      return catastrophe;
    }
  
    
    
    
    
}

exports.root   = rootValue
exports.schema = schema
exports.sse    = sse
