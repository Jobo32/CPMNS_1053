const Realm = require('realm')
const { User } = require('realm/dist/bundle')
let TypeCatastropheSchema = {
  name: 'TypeCatastrophe',
  primaryKey: 'id',
  properties: {
     id: 'int',
     name: 'string',
     description: 'string',
  }
}

let CatastropheSchema = {
  name: 'Catastrophe',
  primaryKey: 'id',
  properties: {
     id: 'int',
     country: 'string',
     city: 'string',
     province: 'string',
     cities: 'string[]', // Array de strings para las ciudades
     type: 'TypeCatastrophe', // Objeto de la clase TypeCatastrophe
     area: 'float',
     date: 'string'
  }
}


let ActionProtocolSchema = {
  name: 'ActionProtocol',
  primaryKey: 'id',
  properties: {
     id: 'int',
     type: 'TypeCatastrophe',
     description: 'string',
     examplesOfCatastrophe: 'string[]'
  }
}
let InsuranceCompanySchema = {
  name: 'InsuranceCompany',
  primaryKey: 'id',
  properties: {
     id: 'int',
     type: 'string',
     name: 'string',
     address: 'string',
     email: 'string'
  }
}
let UserSchema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: 'int',
    address: 'string',
    email: 'string',
    year: 'string',
    preferences: 'string[]'
  }
}
// // // MODULE EXPORTS

let config = {path: './data/cpmns.realm', schema: [CatastropheSchema,TypeCatastropheSchema,ActionProtocolSchema,InsuranceCompanySchema, UserSchema]}

exports.getDB = async () => await Realm.open(config)

// // // // // 

if (process.argv[1] == __filename){ //TESTING PART

  if (process.argv.includes("--create")){ //crear la BD

      Realm.deleteFile({path: './data/cpmns.realm'}) //borramos base de datos si existe

      let DB = new Realm({
        path: './data/cpmns.realm',
        schema: [CatastropheSchema,TypeCatastropheSchema,ActionProtocolSchema,InsuranceCompanySchema, UserSchema]
      })
     
      DB.write(() => {
        let typeCatastrophe = DB.create('TypeCatastrophe', {
                                          id: 1,
                                          name: 'Terremoto',
                                          description: 'Un movimiento brusco de la Tierra causado por la liberación de energía acumulada debido a tensiones geológicas.'});


        let catastrophe = DB.create('Catastrophe', {
                                id: 101,
                                country: 'España',
                                city: 'Castellón de la Plana',
                                province: 'Castellón',
                                cities: ['Castellón de la Plana', 'Villarreal', 'Burriana'],
                                type: typeCatastrophe, // Referenciamos el objeto TypeCatastrophe creado previamente
                                area: 120.5,
                                date: new Date('2024-03-11T18:02:59+01:00') });// La fecha y hora actual

        let actionProtocol = DB.create('ActionProtocol', {
                                id: 301,
                                name: 'string',
                                type: typeCatastrophe, // Referenciamos el objeto TypeCatastrophe creado previamente
                                description: 'Descripción Test' });
                              
        let insuranceCompany = DB.create('InsuranceCompany', {
                                id: 201,
                                type: 'Tipo de compañía', // Asigna el tipo de compañía adecuado
                                name: 'Nombre de la compañía',
                                address: 'Dirección de la compañía',
                                email: 'correo@compania.com' });
                              
        let userSchema = DB.create('User', {
                                id: 401,
                                address: 'Paseo de la Universidad',
                                email: 'correo@ejemplo.com' ,
                                year: '2000',
                                preferences: ['preferencia1', 'preferencia2']
        })
        console.log('Inserted objects', typeCatastrophe, catastrophe, actionProtocol, insuranceCompany, userSchema)
      })
      DB.close()
      process.exit()
  }
  else { //consultar la BD

      Realm.open({ path: './data/cpmns.realm' , schema: [CatastropheSchema,TypeCatastropheSchema,ActionProtocolSchema,InsuranceCompanySchema, UserSchema] }).then(DB => {
        let users = DB.objects('Catastrophe')
        users.forEach(x => console.log(x.country))
        DB.close()
        process.exit()
      })
  }
}
