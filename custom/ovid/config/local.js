module.exports = {

port: process.env.PORT || '1234',
url_root: '',

connections: {
  testDB: {
    adapter: 'sails-mysql',
    host:     'localhost',
    user:     'tester',
    password: 'testpass',
    database: 'ovid_test',
  },
  
  productionDB: {
    adapter: 'sails-mysql',
    host:     'localhost',
    user:     'tester',
    password: 'testpass',
    database: 'ovid',
  },
},

printer_groups: [
	'2nd Floor CRC',
	'3rd Floor CRC',
	'7th Floor CRC',
	'13th Floor CRC'
],

}
