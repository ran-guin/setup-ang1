/**
* Treatment.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName     : 'treatment',

  attributes: {

  	appointment : {
  		model: 'appointment',
  	},

        patient : {
            model : 'patient'
        }, 

  	vaccine: {
  		model: 'vaccine',
  	},

        vaccinator: {
            model : 'staff'
        },
 
 	route: {
 		type: 'string',
 		enum: ['IM - Intramuscular', 'SC - Subcutaneous','ID - Intradermal', 'IN - Intranasal', 'PO - Oral']
 	},

 	site: {
 		type: 'string',
 		enum: ['LA - Left Arm', 'RA - Right Arm', 'LT - Left Thigh', 'RT - Right Thigh']
 	},

 	notes: {
 		type: 'string',
 	},
  	
        applied : {
            type : 'date'
        },

        expiry: {
  		type: 'date'
  	},

  	lot: {
  		type: 'string'
  	},

  	reactionLevel: {
  		type: 'string',
  		enum: ['None','Mild','Strong'],
  	},

  	reactionNotes: {
  		type: 'string'
  	},
        
        status : {
            type: 'string',
            enum: ['Unknown', 'Inactive', 'Active', 'Expired']
        }
  }
};

