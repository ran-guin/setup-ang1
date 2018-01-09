/**
* Prep.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var q = require('q');
var _ = require('underscore-node');

module.exports = {

  /** LEGACY **/
  migrate: 'safe',
  tableName: 'Prep',

 attributes: {
    Prep_ID : { type : 'number' },
    Prep_Comments : { type : 'string' },
    // action : { 
    //   type : 'string',
    //   enum : ['Completed','Failed','Skipped'],
    // },
    // createdBy : { model : 'employee' },
    // Lab_protocol : { model : 'lab_protocol' },
  },

  alias : {
    'id' : 'Prep_ID',
    comments : 'Prep_Comments'
  },
  /** NEW 
  attributes: {
  	name : { type : 'string' },
  	comments : { type : 'string' },
  	action : { 
  		type : 'string',
  		enum : ['Completed','Failed','Skipped'],
  	},
    createdBy : { model : 'employee' },
    Lab_protocol : { model : 'lab_protocol' },
  },
  **/

  save_Prep : function (data, plateData, payload) {
      
    if (!payload) { 
        console.log("*** missing payload in save_Prep");
        return Record.rejected_promise("payload required for update methods");
    }
    console.log("save_Prep");

    var deferred = q.defer();

    Record.createNew('prep', data, null, payload)
    .then (function (result) {
        console.log("Added Prep(s): " + JSON.stringify(result));

        var PrepResult = result;

        var ids = [];
        var prepId = PrepResult.insertId;  // Legacy
        var added = PrepResult.affectedRows;


        for (var i=0; i<plateData.length; i++) {
          plateData[i]['FK_Prep__ID'] = prepId;
        }
        
        Record.createNew('plate_prep', plateData, null, payload)
        .then (function (result2) {
          console.log("Added Plate_Prep: " + JSON.stringify(result2) + '...');
          deferred.resolve({ Prep: result, Plate_Prep: result2})
        })
        .catch ( function (err2) {
          console.log('Error creating container references to prep');
          deferred.reject(err2);
        }); 
    })
    .catch ( function (err) {
      console.log("Error creating prep record");
      deferred.rejecdt(err);
    });

    return deferred.promise;         
  }
      

};

