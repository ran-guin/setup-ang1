/**
* Container.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');

module.exports = {

	attributes: {

	},

	alias: function (name) {
		// enable customization of field names if non-standard //
		var alias = { 
			'volume' : 'Current_Volume',
			'volume_units' : 'Current_Volume_Units',
			'sample_type'  : 'FK_Sample_Type__ID',
			'format' : 'FK_Plate_Format__ID',
			'created' : 'Plate_Created',
			'location' : 'FK_Rack__ID',
		}

		var field = alias[name];
		return field;  // return null if no alias defined... 
	},

	loadData : function (ids) {

		var id_list;
		if (ids == undefined) { id_list = '' }
		else { id_list = ids.join(',') }

		var deferred = q.defer();

		var fields = 'Plate_ID as id, Sample_Type as sample_type, Plate_Format_Type as container_format';
		var query = 'SELECT ' + fields + " FROM Plate LEFT JOIN Sample_Type ON FK_Sample_Type__ID=Sample_Type_ID LEFT JOIN Plate_Format ON FK_Plate_Format__ID=Plate_Format_ID WHERE Plate_ID IN (" + id_list + ')';

		console.log("SQL: " + query);
	    Record.query(query, function (err, result) {
	    	if (err) {
	    		console.log("error: " + err);
	    		deferred.reject("Error: " + err);
	    	}
	    	else {
	    		console.log("DATA: " + JSON.stringify(result));
	    		deferred.resolve(result);
	    	}

	    });
	    	
	    return deferred.promise;
		
	},

	target_specs: function (format_id, prep_id) {
		// fields to be reset when item is cloned from an existing container (eg standard transfer)
		var fields = {
			FK_Plate_Format__ID : format_id,
			Plate_Created       : now(),
			FK_Employee__ID     : sails.config.userid,
			FKLast_Prep__ID     : prep_id,	
		}

		return fields;
	},

	standard_transfer : function (ids, target_format_id, prep_id) {


	},

	rearray_transfer : function ( transfer_parameters ) {

		// input parameters: id [], target_format_id, prep_id, target_size, target_rows, target_cols

		var ids = transfer_parameters['id'];
		var deferred = q.defer();

		var target_format_id = transfer_parameters['target_format_id'];
		var prep_id = transfer_parameters['prep_id'];
		var target_size = transfer_parameters['target_size'];

		var target_dimensions = target_size.split('\s*x\s*');  // 8 x 12 -> [8,12]

		var rows = transfer_parameters['target_rows'] || ['A'];
		var cols = transfer_parameters['target_cols'] || [1];

		var x_min = rows[0];
		var x_max = rows[rows.length-1];
		var y_min = cols[0];
		var y_max = cols[cols.length-1];

		if (target_dimensions.length>1) {
			x_size = target_dimensions[0];
			y_size = target_dimensions[1];
		}

		var fill_by = 'column';  //  add row option later...

		var x = x_min;  
		var y = 1;  

		var array = [];
		var rearray = [];
		var preserve_x = 8;

		var map = {};

		var target_index = 0;
		var target_position = x_min + y_min.toString();
		var targets = ['PLA0']; // CUSTOM TEST

		array.push(targets[target_index], target_position);  // store mul plate record... 
		rearray.push([ids[i], Container.position(ids[i]), targets[target_index], target_position]);

		for (var i=0; i<ids.length; i++) {

			if (fill_by == 'row') {
				y++;
				if (y > y_max) {
					y = 1;
										
					if (x == x_max) {
						x=x_min;
						y = y_min;
						target_index++;       // next plate ... 
					}
					else {
						x = String.fromCharCode(x.charCodeAt(0) + 1);
					}
				}
			}
			else {
				if (x == x_max) {
					x=x_min;
					if (y >= y_max) {
						y=y_min;
						target_index++;       // next plate ... 
						targets.push('PLA' + target_index );
					}
					else {
						y++;
					}
				}	
				else {
					x = String.fromCharCode(x.charCodeAt(0) + 1);
				}

			}

			var target_position = x + y.toString();
			console.log(target_position);
			
			array.push(targets[target_index], target_position);  // store mul plate record... 

			var index = targets[target_index] + ':' + target_position;
			map[index] = ids[i];

			rearray.push([ids[i], Container.position(ids[i]), targets[target_index], target_position]);
		}
		console.log("Map to " + JSON.stringify(targets));
		var data = { map : map, targets : targets, rows : rows,  cols : cols };
		console.log("xfer data: " + JSON.stringify(data));

		deferred.resolve(data);
		return deferred.promise;
	},

	position : function (id) {
		return ' i' + id;
	},

	custom_transfer : function ( custom_parameters ) {
		// Add logic for custom transfer pattern ... 
		return ;
	},

	create_daughter : function (id, target_format_id, prep_id) {
		Record.clone( id, Container.target_specs(target_format_id));
		return;
	},

};

  