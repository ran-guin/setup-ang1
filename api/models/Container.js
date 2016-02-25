/**
* Container.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {

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

		var ids = transfer_parameters['id'];

		var targets = [];
		for (var i=301; i<=401; i++) {
			targets.push(i);
		} // test

		var target_format_id = transfer_parameters['target_format_id'];
		var prep_id = transfer_parameters['prep_id'];
		var target_size = transfer_parameters['target_size'];

		var target_dimensions = target_size.split('\s*x\s*');  // 8 x 12 -> [8,12]
		var x_size = 1;
		var y_size = 1;
		if (target_dimensions.length>1) {
			x_size = target_dimensions[0];
			y_size = target_dimensions[1];
		}

		var fill_by = 'column';  //  add row option later...

		var x = 'A';  
		var y = 1;  

		var target_index = 0;
		var array = [];
		var rearray = [];
		for (var i=0; i<ids.length; i++) {

			// if (fill_by == 'column') {
				y++;
				if (y > y_size) {
					y = 1;
					x++;

					if (x > x_size) {
						x='A';
						y = 1;
						target_index++;       // next plate ... 
					}
				}
			// }
			var target_position = x + y;
			
			array.push(targets[target_index], target_position);  // store mul plate record... 

			rearray.push([ids[i], Container.position(ids[i]), targets[target_index], x+y]);
		}
		console.log("Transfer Map: " + JSON.stringify(rearray));
		console.log("Multiplex Plates: " + JSON.stringify(array))
		return array;
	},

	position : function (id) {
		return ' (position of ' + id;
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

 