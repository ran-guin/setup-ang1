/**
 * View.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var q = require('q');

module.exports = {

  attributes: {
  	name: { type: 'string' },
  	description: { type: 'text'}
  },

  build : function (view_id, fields) {
  	fields = ['thaws','createdBy','Plate.FK_Library__Name'];

  	var deferred = q.defer();

  	var query = 'Select * from view_field, view_table where view_field.table=view_table.table_name AND view_table.view_id = view_field.view_id AND view_field.view_id = ' + view_id;
  	Record.query_promise(query)
	.then ( function (F) {
  		console.log("F: " + JSON.stringify(F));
  		var f = [];
  		var reqd = [];
  		var  tables = [];
  		var conditions = [];
  		var lj = [];

  		for (var i=0; i<fields.length; i++) {
  			var lastcheck = fields.length - 1;
	  		for (var j=0; j<F.length; j++) {
	  			console.log(fields[i] + ' vs ' + F[j]);
	  			if (F[j].field === fields[i] || fields[i] === F[j].prompt || fields[i] === F[j].table + '.' + F[j].field) {

	  				if (F[j].type === 'attribute') {
	  					var primary = F[j].table + '_ID';

	  					var attTable = F[j].table + '_Attribute';
	  					lj.push('Attribute as ' + F[j].field + "_Att ON Attribute_Name = '" + F[j].field + "' AND Attribute_Class = '" + F[j].table + "'");
	  					lj.push(attTable + " ON " + attTable + ".FK_Attribute__ID=" + F[j].field + '_Att.Attribute_ID AND FK_' + F[j].table + '__ID=' + F[j].table + '.' + primary );
	  				}
	  				else {
	  					f.push(F[j].table + '.' + F[j].field + ' AS ' + F[j].prompt);
	  				}
	  					
	  				if (tables.indexOf(F[j].table) === -1) {
	  					tables.push(F[j].table)
	  					if (F[j].join_condition !== '1') { conditions.push(F[j].join_condition) }
	  				}
	  				j=F.length;
	  			}
	  			else if (i === lastcheck && F[j].mandatory) {
	  				reqd.push(F[j].table + '.' + F[j].field + ' AS ' + F[j].prompt)
	  				var $tab = F[j].table;
	  				
	  				if (tables.indexOf(F[j].table) === -1) {
	  					tables.push(F[j].table)
	  				}
	  			}
	  		}
  		}

  		if (reqd) {
  			for (var k=0; k<reqd.length; k++) {
  				f.push(reqd[k]);
  			}
  		}
  		var select = "SELECT " + f.join(', ') + ' FROM (' + tables.join(', ') + ')';

  		if (lj.length) { select += " LEFT JOIN " + lj.join(' LEFT JOIN ') }

  		if (conditions) { select += " WHERE " + conditions.join(' AND ') }

  		console.log("QUERY: " + select);
		Record.query_promise(select)
		.then ( function (result) {
			deferred.resolve(result);
		})
		.catch ( function (err) {
			console.log('error with query ?');
			deferred.reject(err);
		})
  	})
  	.catch ( function (err) {
  		console.log("Error retrieving view tables")
  		deferred.reject(err);
  	})

  	return deferred.promise;
  }
};

