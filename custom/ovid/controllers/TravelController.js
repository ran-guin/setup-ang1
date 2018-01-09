/**
 * TravelController
 *
 * @description :: Server-side logic for managing travels
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	recommendations : function (req, res) {
		var patient = req.param('patient');

		Travel.find( { patient : patient })
		.populate('region')
		.then ( function (travelPlans) {
			console.log("Get Travel Plans: " + JSON.stringify(travelPlans));

			var response = travelPlans;
			var regions = '0';
			for (var i=0; i<travelPlans.length; i++) {
				var region = travelPlans[i].region.id;
				var applicable = travelPlans[i].region.applicable || String(region) ;
				
				response[i].applicableRegions = [];
				response[i].recommendations = [];
				console.log("Split " + JSON.stringify(applicable));

				if (applicable) { 
					regions = regions + ',' + applicable;
					response[i].applicableRegions = applicable.split(',');
				}
				
			}
			
			var list = regions.split(',');

			console.log('add recommendations for regions: ' + list.join(',') )
			Recommendation.find( { region : list } )
			.populate('disease')
			.populate('vaccine')
			.then (function (recomm) {
				if (recomm.length) {
					console.log("R: " + JSON.stringify(recomm));
					for (var i=0; i<response.length; i++) {
						for (var j=0; j<recomm.length; j++) {
							
							console.log('look for ' + recomm[j].region + ' in ' + response[i].applicableRegions.join(','));
							if ( response[i].applicableRegions.indexOf(recomm[j].region) === undefined ) { }
							else {
								response[i].recommendations.push(recomm[j]);
								console.log("added recommendations for " + recomm[j].region);
							}
						}
					}
				}
				//travelPlans[i].recommendations = recomm;

				return res.send(response);

			});

			
		});

	}
};

