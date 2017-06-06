module.exports = {

port: process.env.PORT || '1234',
url_root: '',

connections: {
  testDB: {
    adapter: 'sails-mysql',
    host:     'localhost',
    user:     'tester',
    password: 'testpass',
    database: 'social_test',
  },
  
  productionDB: {
    adapter: 'sails-mysql',
    host:     'localhost',
    user:     'tester',
    password: 'testpass',
    database: 'social',
  },
  
  demoDB: {
    adapter: 'sails-mysql',
    host:     'localhost',
    user:     'tester',
    password: 'testpass',
    database: 'social_demo',
  },
},

printer_groups: [
],

}
