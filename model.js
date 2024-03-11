const Realm = require('realm')

let UserSchema = {
   name: 'User',
   primaryKey: 'name',
   properties: {
      name: 'string',
      passwd: 'string'
   }
}

let PostSchema = {
  name: 'Post',
  primaryKey: 'title',
  properties: {
    timestamp: 'date',
    title: 'string', 
    content: 'string',
    author: 'User',
    blog: 'Blog'
  }
}

let BlogSchema = {
  name : 'Blog',
  primaryKey: 'title',
  properties:{
     title: 'string',
     creator: 'User' //esto es una referencia a un usuario
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
     area: 'double',
     date: 'date'
  }
};

let TypeCatastropheSchema = {
  name: 'TypeCatastrophe',
  primaryKey: 'id',
  properties: {
     id: 'int',
     name: 'string',
     description: 'string'
  }
};

// // // MODULE EXPORTS

let config = {path: './data/blogs.realm', schema: [PostSchema, UserSchema, BlogSchema,CatastropheSchema,TypeCatastropheSchema]}

exports.getDB = async () => await Realm.open(config)

// // // // // 

if (process.argv[1] == __filename){ //TESTING PART

  if (process.argv.includes("--create")){ //crear la BD

      Realm.deleteFile({path: './data/blogs.realm'}) //borramos base de datos si existe

      let DB = new Realm({
        path: './data/blogs.realm',
        schema: [PostSchema, UserSchema, BlogSchema,CatastropheSchema,TypeCatastropheSchema]
      })
     
      DB.write(() => {
        let user = DB.create('User', {name:'user0', passwd:'xxx'})
        
        let blog = DB.create('Blog', {title:'Todo Motos', creator: user})
        
        let post = DB.create('Post', {
                                        title: 'prueba moto', 
                                        blog:blog, 
                                        content: 'esto es una prueba de motos',
                                        creator: user, 
                                        timestamp: new Date()})
                                        // Primero, creamos un objeto TypeCatastrophe
        let typeCatastrophe = DB.create('TypeCatastrophe', {
                                                                id: 1,
                                                                name: 'Terremoto',
                                                                description: 'Un movimiento brusco de la Tierra causado por la liberación de energía acumulada debido a tensiones geológicas.'});

      // Luego, creamos un objeto Catastrophe
      let catastrophe = DB.create('Catastrophe', {
                                                      id: 101,
                                                      country: 'España',
                                                      city: 'Castellón de la Plana',
                                                      province: 'Castellón',
                                                      cities: ['Castellón de la Plana', 'Villarreal', 'Burriana'],
                                                      type: typeCatastrophe, // Referenciamos el objeto TypeCatastrophe creado previamente
                                                      area: 120.5,
                                                      date: new Date('2024-03-11T18:02:59+01:00') });// La fecha y hora actual
 

        

      console.log('Inserted objects', user, blog, post,typeCatastrophe,catastrophe)
      })
      DB.close()
      process.exit()
  }
  else { //consultar la BD

      Realm.open({ path: './data/blogs.realm' , schema: [PostSchema, UserSchema, BlogSchema,CatastropheSchema,TypeCatastropheSchema ] }).then(DB => {
        let users = DB.objects('User')
        users.forEach(x => console.log(x.name))
        let blog = DB.objectForPrimaryKey('Blog', 'Todo Motos')
        if (blog)
           console.log(blog.title, 'by', blog.creator.name)
        DB.close()
        process.exit()
      })
  }
}

