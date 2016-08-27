/**
* Printer_group.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');

module.exports = {

  migrate: 'safe',
  tableName : 'Printer_Group',

  attributes: {

  },

  // customize this list, since it is needed prior to connection to the database
  // Note name must exactly match printer_group names in the database...
  printer_groups : [
  
  ],

  load_printer : function (group, type) {

  	var deferred = q.defer();

  	var conditions = [
  		'FK_Printer__ID=Printer_ID',
  		'FK_Printer_Group__ID=Printer_Group_ID'
  	];

  	if (group) {
  		conditions.push("Printer_Group_Name = '" + group + "'");
  	}

  	if (type) {
  		conditions.push('FK_Label_Type__ID = ' + type);
  	}

  	var query = Record.build_query( { 
  		tables: ['Printer','Printer_Assignment','Printer_Group'],
  		fields: ['Printer_Name', 'Printer_Assignment.FK_Label_Format__ID'],
  		conditions: conditions,
  	});

  	console.log(query);
  	Record.query_promise(query)
  	.then ( function (result) {
  		console.log("Printers: " + JSON.stringify(result));
  		deferred.resolve(result);
  	})
  	.catch ( function (err) {
  		console.log("Error retrieving printers: " + err);
  		deferred.reject(err);
  	});

  	return deferred.promise;
  }
};


