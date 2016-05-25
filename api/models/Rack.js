/**
* Rack.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');

module.exports = {
	tableName: 'Rack',
	// ** LEGACY **/
	migrate: 'safe',
	attributes: {
		Rack_ID : { type : 'integer'},
		Rack_Name : { type : 'string' },
		Rack_Alias : { type : 'stirng' },
		FK_Equipment__ID : { model : 'equipment'},
		FKParent_Rack__ID : { model : 'rack'}
  },

  garbage : function () {
    return 1;  // test 
  },

  boxContents : function (rack_id, content_types, conditions) {

    var deferred = q.defer();

    var tables = ['Rack'];
    var fields = ['count(*) as Count', ' Rack_ID', 'FKParent_Rack__ID', 'Rack_Name', 'Rack_Type'];

    if (!conditions) { conditions = [] }

    var content_types = ['Plate','Solution'];
    
    var rack_ids;
    if (!rack_id) {
      console.log("No Rack ID supplied");
      deferred.reject('no rack id');
    }
    else if (rack_id.constructor === Array) {
      rack_ids = rack_id;
    }
    else if (rack_id.match(/,/) ) {
      rack_ids = rack_id.split(/\s*,\s*/);
    }
    else {
      rack_ids = [rack_id];
    }

    // Box specific conditions //
    conditions.push("Rack_Type = 'Slot'");
    conditions.push("FKParent_Rack__ID IN (" + rack_ids.join(',') + ')');

    var left_joins = [];


    for (var i=0; i<content_types.length; i++) {
      var content_type = content_types[i]; 
      left_joins.push(content_type + " ON " + content_type + ".FK_Rack__ID=Rack_ID");
      fields.push(content_type + '_ID');
    }

    var query = Record.build_query({tables: tables, fields: fields, left_joins: left_joins, conditions: conditions, group: ['Rack_ID'] });

    Record.query_promise(query)
    .then ( function (data) {
      console.log("Query: " + query);
      console.log("Result: " + JSON.stringify(data));
  
      var contained = {};
      var available = {};
      for (var i=0; i<data.length; i++) {
        var boxid = data[i].FKParent_Rack__ID;
        var id    = data[i].Rack_ID;

        if (!available[boxid]) { available[boxid] = []}

        var position = data[i].Rack_Name;

        for (j=0; j<content_types.length; j++) {
          var type = content_types[j];
          if (data[i][type + '_ID']) {
            var contains = data[i][type + '_ID'];
            if (!contained[boxid]) { 
              contained[boxid] = {}
            }
            if (! contained[boxid][position]) { contained[boxid][position] = {} }
            contained[boxid][position][type] = contains;
          }
        }
        if (! ( contained[boxid] && contained[boxid][position]) )  { available[boxid].push(position) }

      }

      console.log("Contains: " + JSON.stringify(contained));
      console.log("Available: " + JSON.stringify(available));

      deferred.resolve({ contains: contained, available: available});
    })
    .catch ( function (err) {
      console.log("Error: " + err);
      deferred.reject(err);
    });	

    return deferred.promise;
  }
};

