/**
* Printer_group.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');
var _ = require('underscore-node');

module.exports = {

  migrate: 'safe',
  tableName : 'Printer_Group',

  attributes: {

  },

  // customize this list, since it is needed prior to connection to the database
  // Note name must exactly match printer_group names in the database...
 
  // printer_groups: function () {
  //       '13th Floor BCG',
  //       '13th Floor CCR',
  //       '7th Floor CG',
  //       'Printing Disabled'
  // ],


  printer_groups: function () {
    var deferred = q.defer();

    var query = "SELECT Printer_Group_Name as name from Printer_Group where Printer_Group_Status = 'Active'";
    
    Record.query_promise(query)
    .then (function (result) {
      var list = _.pluck(result, 'name');
      deferred.resolve(list);
    })
    .catch (function (err){
      console.log("error trying to retrieve printers: " + err);
      deferred.resolve([]);
    });

    return deferred.promise;
  },

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
  		conditions.push('Printer_Assignment.FK_Label_Format__ID = ' + type);
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
  		err.context = 'loading printers';
  		deferred.reject(err);
  	});

  	return deferred.promise;
  }
};


