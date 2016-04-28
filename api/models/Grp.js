/**
* Grp.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName : 'Grp',
  migrate : 'safe',

  attributes: {
  	name : { type: 'string'},
  	access : { type: 'string'},
  	department : { model: 'Department'},
  	
  	members : { 
  		collection : 'user',
  		via : 'groups'
  	}
  },

  initData : [
    { name : 'Admin', access : 'read,write,delete', department: 1},
    { name : 'Users', access : 'read,write,delete', department: 1},
    { name : 'Guest', access : 'read', department: 1},
  ],

};

