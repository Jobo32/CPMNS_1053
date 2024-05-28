const { graphql, buildSchema } = require('graphql')
const Realm = require('realm')
//import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

//import { graphql, buildSchema} from 'graphql'

//import model from 'model'
const model = require('./model') //Database

const graph = require('./datosproyecto.json')
let DB

model.getDB().then(db => {DB = db})

//Notifications
const sse  = require('./utils/notifications')
const { forEach } = require('lodash')
sse.start()

const schema = buildSchema(`
  type Query {
    catastrophe: [Catastrophe]
    insuranceCompanies: [InsuranceCompany]
    actionProtocols: [ActionProtocol]
    typecatastrophe: [TypeCatastrophe]
    users: [User]
    jsonLD: String
    getInfoCatastropheById(idCatastrophe: ID!): Catastrophe
    
    getActionProtocolsByType(typeId: ID!): [ActionProtocol]
    
  }
  type Mutation{
    createOrReplacePreferencesOfAlert(userId: ID, newProvince: String, idtypeCatastrophe: ID): Preference 
    newCatastropheAlert(
      country: String
      city: String
      province: String
      cities: [String]
      idtype: ID
      area: Float
      date: String): Catastrophe
  }
  type TypeCatastrophe{
    _id: ID
    name: String
    description: String
  }
  type Catastrophe{
    _id: ID
    country: String
    city: String
    province: String
    cities: [String]
    type: TypeCatastrophe
    area: Float
    date: String
  }
  
  type ActionProtocol {
    _id: ID
    name: String
    description: String
    type: TypeCatastrophe
  }
  type InsuranceCompany{
    _id: ID
    type: String
    name: String
    address: String
    email: String
  }
  type User{
    _id: ID,
    address: String,
    email: String,
    year: String,
    preferences: [Preference]
  }
  type Preference{
    _id: ID,
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


    getInfoCatastropheById: ({ idCatastrophe }) => {
      const objectID = new Realm.BSON.ObjectId(idCatastrophe)
      const catastrophe = DB.objectForPrimaryKey('Catastrophe', objectID)
      // Verifica si se encontró la catástrofe
      if (!catastrophe) {
          throw new Error('Catástrofe no encontrada');
      }
      console.log(catastrophe)
      // Devuelve la información de la catástrofe encontrada
      return catastrophe;
    },  
    getActionProtocolsByType: ({ typeId }) => {
      const objectID = new Realm.BSON.ObjectId(typeId);
      console.log(objectID);
      console.log("--------------------");
      return DB.objects('ActionProtocol').filter(protocol => {
          console.log(protocol.type._id);
          return protocol.type._id.equals(objectID); // Compara los ObjectIds
      });

    },
    newCatastropheAlert: ({ country,city, province, cities, idtype, area, date }) => {
      
      let newCatastrophe = null;
      const objectID= new Realm.BSON.ObjectId(idtype)
      // Crear un nuevo objeto de catástrofe con los datos proporcionados
      let data = {
          _id: new Realm.BSON.ObjectId(),
          country: country,
          city: city,
          province: province,
          cities: cities,
          type: DB.objectForPrimaryKey('TypeCatastrophe', objectID), // Obtener el objeto de tipo de catástrofe por su ID
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
    createOrReplacePreferencesOfAlert: ({userId, newProvince, idtypeCatastrophe}) => {
      let newPreference = null;
      //comprobar si existe en ese user dicha preferencia
      const userObjectId = new Realm.BSON.ObjectId(userId)
      const typeObjectId = new Realm.BSON.ObjectId(idtypeCatastrophe)
      var usuario = DB.objectForPrimaryKey('User', userObjectId)
      console.log(usuario)
      var listaDePreferences = usuario.preferences
      var existePrefrence = false
      
      listaDePreferences.forEach(element => {
        if((element.province == newProvince && element.typeCatastrophe)){
          existePrefrence=true
        }
      })
      
      if(!existePrefrence){
        
        let data = {
          _id: new Realm.BSON.ObjectId(),
          typeCatastrophe: DB.objectForPrimaryKey('TypeCatastrophe', typeObjectId),
          province: newProvince
        }
        
        DB.write(() => {
          newPreference = DB.create('Preference', data);
          usuario.preferences.push(newPreference)
          
        })

      }
      return newPreference;
      
    }, 
    jsonLD:()=>{
      return JSON.stringify(graph)
    }
}

exports.root   = rootValue
exports.schema = schema
exports.sse    = sse
