/**
 * Attribute.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

	attributes: {

	},

	'load_Prep_Attributes' : function (input, cb) {		

		var Plate_attributes = [];
		var Prep_attributes = [];

		console.log(message + " Input: " + JSON.stringify(input));
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

	'options' : function (Aclass, attribute, cb) {		

		console.log("find " + Aclass + " : " + attribute);
		var q = "SELECT * from Attribute WHERE Attribute_Class = '" + Aclass + "' AND Attribute_Name = '" + attribute + "'";
		console.log("query: " + q);

		Attribute.query(q, function (err, result) {
		// Attribute.findOne({ 'Attribute_Class': Aclass, 'Attribute_Name': attribute})    // findOne probably requires standard id field ... 
			console.log("got result: " + JSON.stringify(result));
			return cb(null, result);
		});

	},

};

