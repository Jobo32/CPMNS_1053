const { graphql, buildSchema } = require('graphql')
//import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

//import { graphql, buildSchema} from 'graphql'

//import model from 'model'
const model = require('./model') //Database

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
    
    getInfoCatastropheById(idCatastrophe: Int!): Catastrophe
    
    getActionProtocolsByType(typeId: Int!): [ActionProtocol]
    
  }
  type Mutation{
    createOrReplacePreferencesOfAlert(userId: Int, preferenceId: Int, newProvince: String, idtypeCatastrophe: Int): Preference
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
    name: String
    description: String
    type: TypeCatastrophe
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
    preferences: [Preference]
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
    createOrReplacePreferencesOfAlert: ({userId, preferenceId, newProvince, idtypeCatastrophe}) => {
      let newPreference = null;
      //comprobar si existe en ese user dicha preferencia
      var usuario = DB.objects('User').filter(user => user.id === userId)
      var listaDePreferences = usuario[0].preferences
      var existePrefrence = false
      
      listaDePreferences.forEach(element => {
        if((element.province == newProvince && element.typeCatastrophe)){
          existePrefrence=true
        }
      })
      
      if(!existePrefrence){
        
        let data = {
          id: preferenceId,
          typeCatastrophe: DB.objectForPrimaryKey('TypeCatastrophe', idtypeCatastrophe),
          province: newProvince
        }
        
        DB.write(() => {
          newPreference = DB.create('Preference', data);
          usuario[0].preferences.push(newPreference)
          
        })

      }
      return newPreference;
      
    }
}

exports.root   = rootValue
exports.schema = schema
exports.sse    = sse
