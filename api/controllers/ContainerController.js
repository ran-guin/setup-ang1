/**
 * ContainerController
 *
 * @description :: Server-side logic for managing containers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var q = require('q');
var xlsx = require('node-xlsx');

var Logger = require('../services/logger');

module.exports = {
	
	history : function (req, res) {
		var ids = req.param('ids');
		var element = req.param('element') || 'injectedHistory';  // match default in CommonController
		var include_parents = req.param('include_parents');

		var fields = ['Count(DISTINCT Plate.Plate_ID) as Samples', 'Group_Concat(distinct Plate_Prep.FK_Plate_Set__Number) as Sets', 'Prep_Name as Step', 'lab_protocol.name as Protocol', 'Prep_DateTime as Completed', 'Group_Concat(DISTINCT Employee_Name) as Completed_By'];
		fields.push("CASE WHEN Max(Attribute_ID) IS NULL THEN '' ELSE GROUP_CONCAT( DISTINCT CONCAT(Attribute_Name,'=',Attribute_Value) SEPARATOR ';<BR>') END as attributes");
		fields.push("Group_Concat(Distinct FK_Solution__ID) as Reagent_ID")

		fields.push('Prep_Comments as Comments');

		var query = "SELECT " + fields.join(',') + " FROM (Plate, Plate_Prep, Prep, lab_protocol)";

		query = query + " LEFT JOIN Prep_Attribute ON Prep.Prep_ID=Prep_Attribute.FK_Prep__ID";
		query = query + " LEFT JOIN Employee ON Prep.FK_Employee__ID=Employee_ID";
		query = query + " LEFT JOIN Attribute ON Prep_Attribute.FK_Attribute__ID=Attribute_ID";
		
		var relevant_list;
		if (include_parents) { 
			query = query + " LEFT JOIN Plate AS Scanned ON Scanned.FKOriginal_Plate__ID=Plate.FKOriginal_Plate__ID";
			relevant_list = 'Scanned.Plate_ID IN (' + ids + ')';
		}
		else { 
			relevant_list = 'Plate.Plate_ID IN (' + ids + ')';
		}

		query = query + " WHERE FK_Plate__ID = Plate.Plate_ID AND Plate_Prep.FK_Prep__ID=Prep_ID AND Prep.FK_Lab_Protocol__ID=lab_protocol.id ";

		query = query + " AND " + relevant_list;

		query = query + " GROUP BY Prep_ID ORDER BY Prep_DateTime, Prep_ID";

		console.log("Q: " + query);
		Record.query_promise(query)
		.then ( function (result) {
			// console.log("got data: " + JSON.stringify(result));

			return res.render('customize/injectedData', { fields : fields, data : result, title: 'Sample History', element: element, href: {Sets : "scan-barcode?barcode=Set<Sets>"} });
		})
		.catch ( function (err) {
			Logger.warning(err, "could not inject data", 'history')
			return res.json("error injecting data");
		})

	}, 

	summary : function (req, res) { 
		var ids = req.param('ids') || [];
		var element = req.param('element') || 'injectedData';   // match default in CommonController
		var render = req.param('render') || 0;

		var flds = ['id','sample_type', 'created', 'box_id', 'box_size', 'position', 'container_format', 'qty', 'qty_units', 'attributes','parent','grandparent'];

		var add_fields = [];
		add_fields.push("CASE WHEN Parent.Plate_ID IS NULL THEN 'n/a' ELSE CONCAT( Parent.Plate_ID, '<BR>[', PS.Sample_Type,']') END as parent");
		add_fields.push("CASE WHEN Parent.Plate_ID IS NULL THEN 'n/a' ELSE CONCAT( GP.Plate_ID, '<BR>[', GPS.Sample_Type,']') END as grandparent");

		var left_joins = [];
		left_joins.push("Plate as Parent ON Parent.Plate_ID=Plate.FKParent_Plate__ID");
		left_joins.push("Plate as GP ON GP.Plate_ID=Parent.FKParent_Plate__ID");

		left_joins.push("Sample_Type as PS ON PS.Sample_Type_ID=Parent.FK_Sample_Type__ID");
		left_joins.push("Sample_Type as GPS ON GPS.Sample_Type_ID=GP.FK_Sample_Type__ID");
		
		Container.loadData(ids, null, { add_fields: add_fields, add_left_joins: left_joins })
		.then (function (result) {
			if (render) {
				return res.render('customize/injectedData', { fields : flds, data : result, title: 'Sample Info', element: element});
			}
			else {
				return res.json(result);
			}		
		})
		.catch ( function (err) {
			Logger.warning(err, 'could not inject info', 'summary');
			return res.json("error injecting Sample Info");
		});
	},

	storage_history : function (req, res) { 
		var ids = req.param('ids') || '';
		var element = req.param('element') || 'injectedData';   // match default in CommonController
		var render = req.param('render') || 0;

		var flds = ['Container', 'Moved_from', 'Moved_to', 'position', 'parent', 'Moved_by', 'moved'];

		Container.storage_history(ids.split(','))
		.then (function (result) {
			if (render) {
				return res.render('customize/injectedData', { fields : flds, data : result, title: 'Sample Tracking', element: element});
			}
			else {
				return res.json(result);
			}		
		})
		.catch ( function (err) {
			Logger.warning(err, 'could not inject storage history', 'storage_history');
			return res.json("error injecting Storage History");
		});
	},

	transfer : function (req, res ) {
		console.log("CC transfer prompt");

		var Samples = {};
		var Target = {};
		var Options = {};

		var split;
		var sources = [];

		console.log("BODY" + JSON.stringify(req.body));

		if (req.body) {
			var samples = req.body['Samples'] || {};
			var target  = req.body['Target'] || "{}";
			var options = req.body['Options'] || "{}";

			Sources = JSON.parse(samples);
			Target  = target;
			Options = JSON.parse(options);

			var ids = [];
			for (var i=0; i<Sources.length; i++) {
				ids.push(Sources[i].id);
			}

			// console.log("BODY: " + JSON.stringify(req.body));
			Sources = JSON.parse(req.body.Samples);
			var target_size = req.body['Capacity-label'] || 1;

			var backfill_date = req.body['backfill_date'];

			var sizes = Object.keys(Rack.wells);				
			console.log("target_size: " + target_size);
			console.log("backfill_date: " + backfill_date);

			console.log("*****. RENDER Well MAP ****** ");
			return res.render(
					'lims/WellMap', 
					{ Samples: Sources, plate_ids: ids, options : { split : split, backfill_date: backfill_date }, target_size: target_size, sizes: sizes, wells: Rack.wells}
			);
		}
		else {
			return res.json('invalid input');
		}


	},

	completeTransfer : function (req, res ) {
		console.log("CC completing transfer");

		var ids = req.body['ids'] || [];
		var Options = req.body['Options'] || {};
		var Transfer = req.body['Transfer'] || {};

		var payload = req.session.payload || {};

		q.when( Container.execute_transfer(ids, Transfer, Options, payload) )
		.then ( function (results) {
			console.log("\n**Executed transfer: " + JSON.stringify(results));
			// already handled within execute_transfer if transfer_type == Move
			// Container.transfer_Location(results.plate_ids, Transfer);
			return res.json(results);
		})
		.catch ( function (err) {
			console.log("Problem executing transfer");
			Logger.error(err, "Problem executing transfer", 'completeTransfer')
			return res.json(err);
		})

	},

	uploadMatrix : function (req, res) {

		var MatrixAttribute_ID = 66;
		var body = req.body || {};

		var payload = req.session.payload || {};

		// Expects 8 rows of 12 columns (A1..H12) //
	    res.setTimeout(0);

	    var samples = body.Samples;
	    var Samples;
	    var ids = body.ids || body.plate_ids;

	    if (!ids && samples) { ids = _.pluck(samples, 'id') }

	    if (ids && ids[0]) {
		    Samples = JSON.parse(samples);
		    var force = body.force || 1;
		    var file = req.file('MatrixFile');

		    Upload.uploadMatrixFile(file, { update: 'barcode', samples: Samples, force: force }, payload)
		    .then ( function (result) {
		    	console.log("uploaded Matrix File with defined samples");
		    	console.log("ids = " + JSON.stringify(ids));
		    	console.log("samples = " + JSON.stringify(samples));
		    	console.log(JSON.stringify(result));
		    	return res.render('lims/Container', { 
								plate_ids: ids, 
								Samples: Samples, 
				});
		    })
		    .catch ( function (err) {
		    	console.log("Error uploading Matrix File: ");
		    	var msg = Record.parse_standard_error(err);

		    	Logger.error(err, "problem uploading matrix file");

				return res.render('lims/Container', { 
					plate_ids: ids, 
					Samples: Samples,
					errors: [ msg ],
				});
			});
		} 
		else {
		    var force = body.force || 1;
		    var file = req.file('MatrixFile');

		    Upload.uploadMatrixFile(file, { force: force, update: 'position' }, payload)
		    .then ( function (result) {
		    	console.log("uploaded Matrix File without samples");
		    	console.log("FINISHED " + JSON.stringify(result));

				return res.render('customize/private_home');
				// 	'lims/Container', { 
				// 	plate_ids: ids, 
				// 	Samples: Samples, 
				// 	errors : ["Missing ids or Samples"],
				// });
			})
			.catch ( function (err) {
				console.log("Error loading matrix file");
				return res.render('customize/private_home');
					// 'lims/Container', {
					// plate_ids: ids, 
					// Samples: Samples, 
					// errors : ["Missing ids or Samples"],
				// });
			}) 
		}

  	},

};

  