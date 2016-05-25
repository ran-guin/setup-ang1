/**
* Lab_protocol.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

  },


	'load_Attributes' : function (input, cb) {		

		var Plate_attributes = [];
		var Prep_attributes = [];

		console.log("Input: " + JSON.stringify(input));
		for (j=0; j<input.length; j++) {
			var att1 = input[j].replace('Plate_Attribute=','');
			var att2 = input[j].replace('Prep_Attribute=','');
			if (att1 != input[j]) { Plate_attributes.push(att1) }
			else if (att2 != input[j]) { Prep_attributes.push(att2) }

			// console.log("Plate Atts: " + JSON.stringify(Plate_attributes));
			// console.log("Prep Atts: " + JSON.stringify(Prep_attributes));
		}	

		return cb(null, { 'Plate' : Plate_attributes, 'Prep' : Prep_attributes });

	},


};

