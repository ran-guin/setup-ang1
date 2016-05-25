/**
* Staff.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName     : 'staff',

  access : 'normal',

  attributes: {

    user_id: {
      model: 'user',
      extrainfo: 'testforextrainfo',
    },

    alias: {
      type: 'string'
    },

  	role: {
  		type: 'string',
  		enum: ['Desk Staff', 'Nurse', 'Doctor', 'Technician', 'Researcher' ],
      description: "Staff Position",
    },

  }
};

