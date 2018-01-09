module.exports = {

port: process.env.PORT || '1234',
url_root: '',

connections: {
  testDB: {
    adapter: 'sails-mysql',
    host:     'localhost',
    user:     'tester',
    password: 'testpass',
    database: 'init',
  },
  
  productionDB: {
    adapter: 'sails-mysql',
    host:     'localhost',
    user:     'tester',
    password: 'testpass',
    database: 'init',
  },
},

printer_groups: [
],

}
