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
    insuranceCompanies: [InsuranceCompany]
    actionProtocols: [ActionProtocol]
    typecatastrophe: [TypeCatastrophe]
    users: [User]
    
    getInfoCatastropheById(idCatastrophe: Int!): Catastrophe
    
    getActionProtocolsByType(typeId: Int!): [ActionProtocol]
    
  }
  type Mutation{
    createOrReplacePreferencesOfAlert(userId: Int, preferenceId: Int, province: String, idtypeCatastrophe: Int): Preference
    newCatastropheAlert(id: Int
      country: String
      city: String
      province: String
      cities: [String]
      idtype: Int
      area: Float
      date: String): Catastrophe
  }
  type TypeCatastrophe{
    id: Int
    name: String
    description: String
  }
  type Catastrophe{
    id: Int
    country: String
    city: String
    province: String
    cities: [String]
    type: TypeCatastrophe
    area: Float
    date: String
  }
  
  type ActionProtocol {
    id: Int
    description: String
    type: TypeCatastrophe
    examplesOfCatastrophe: [String]
  }
  type InsuranceCompany{
    id: Int
    type: String
    name: String
    address: String
    email: String
  }
  type User{
    id: Int,
    address: String,
    email: String,
    year: String,
    preferences: [String]
  }
  type Preference{
    id: Int,
    typeCatastrophe: TypeCatastrophe,
    province: String
  }
`)


const rootValue = {
    catastrophe: () => DB.objects('Catastrophe'),
    typecatastrophe: () => DB.objects('TypeCatastrophe'),
    users: () => DB.objects('User'),
    insuranceCompanies: () => DB.objects('InsuranceCompany'),
    actionProtocols: () => DB.objects('ActionProtocol'),

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
    },  
    getActionProtocolsByType: ({ typeId }) => {
      return DB.objects('ActionProtocol').filter(protocol => protocol.type.id === typeId);
    },
    newCatastropheAlert: ({ id, country,city, province, cities, idtype, area, date }) => {
      
      let newCatastrophe = null;
      
      // Crear un nuevo objeto de catástrofe con los datos proporcionados
      let data = {
          id: id,
          country: country,
          city: city,
          province: province,
          cities: cities,
          type: DB.objectForPrimaryKey('TypeCatastrophe', idtype), // Obtener el objeto de tipo de catástrofe por su ID
          area: area,
          date: date
      };
      console.log(data)
      // Escribir el nuevo objeto de catástrofe en la base de datos
      DB.write(() => {
          newCatastrophe = DB.create('Catastrophe', data);
      });
  
      // Emitir un evento de nueva catástrofe utilizando SSE
      sse.emitter.emit('new-catastrophe', newCatastrophe);
  
      return newCatastrophe;
    },
    createOrReplacePreferencesOfAlert: ({userId, preferenceId, province, typeCatastrophe}) => {
      let newPreference = null;
      //Se deberia comprobar si existe en ese user dicha preferencia
      let data = {
        id: id,
        typeCatastrophe: DB.objectForPrimaryKey('TypeCatastrophe', idtype),
        province: province
      }
      DB.write(() => {
        newPreference = DB.create('Preference', data);
        //DUDA de como meter la nueva preferencia en la entidad de user
      })
      return newPreference;
      //POR IMPLEMENTAR
    }
  
  
    
    
    
    
}

exports.root   = rootValue
exports.schema = schema
exports.sse    = sse
