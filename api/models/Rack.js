/**
* Rack.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var q = require('q');

module.exports = {

	tableName: 'Rack',
  primaryField: 'Rack_ID',
  
	// ** LEGACY **/
	migrate: 'safe',
	attributes: {
		Rack_ID : { type : 'integer'},
		Rack_Name : { type : 'string' },
		Rack_Alias : { type : 'string' },
		FK_Equipment__ID : { model : 'equipment'},
		FKParent_Rack__ID : { model : 'rack'},
    Rack_Type : { 
      type : 'string',
      enum : ['Shelf','Rack','Box','Slot'],
    },
    Capacity : { 
      type : 'string',
      enum : ['1', '9x9','8x12']
    },
  },

  alias: {
    'id' : 'Rack_ID',
    'parent' : 'FKParent_Rack__ID',
    'name' : 'Rack_Alias',
  },

	track_history: [
		'FK_Equipment__ID',
		'FKParent_Rack__ID',
	],

  subtypes : ['Shelf','Rack','Box','Slot'],

  wells : {
    '1x1' : [['A1']],
    '9x9' : [
      ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'],
      ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9'],
      ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'],
      ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9'],
      ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9'],
      ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'],
      ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9'],
      ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9'],
      ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9'],
    ],
    '8x12' : [
      ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12'],
      ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12'],
      ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12'],
      ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12'],
      ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12'],
      ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
      ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12'],
      ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11', 'H12'],
    ]
  },

  garbage : function () {

    var deferred = q.defer();

    Record.query_promise("Select Rack_ID from Rack where Rack_Name = 'Garbage'" )
    .then (function (result) {
      if (result.length == 1) {
        deferred.resolve(result[0].Rack_ID);
      }
      else {
        deferred.resolve(null);
      }
      
    })
    .catch ( function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  },

  addSlottedBox : function addSlottedBox (parent, name, size, payload) {

    var deferred = q.defer();

    var wells = Rack.wells[size];
    if (! wells || !name || !size) {
      var e = new Error("non standard size ? " + size);
      deferred.reject(e);
    }
    else {

      Record.query_promise("Select Rack_Alias,FK_Equipment__ID from Rack where Rack_ID = " + parent)
      .then (function (result) {
        if (result.length == 1) {
          var alias = result[0]['Rack_Alias'];
          var equip = result[0]['FK_Equipment__ID']

          var boxData = [ { Rack_Name: name, Rack_Alias: alias + ' ' + name, FKParent_Rack__ID : parent, Rack_Type: 'Box', FK_Equipment__ID: equip, Movable: 'Y', Rack_Full: 'N', Capacity: size }]
          
          Record.createNew('Rack', boxData, {}, payload)
          .then ( function (boxResult) {
            var parent = boxResult.insertId;  
            console.log("Created box " + parent);
            var slotData = [];
            for (var row=0; row<wells.length; row++) {
              for (var col=0; col<wells[row].length; col++) {
                var well = wells[row][col];
                var slot = well.toLowerCase();

                var data = { Rack_Name: slot, Rack_Alias: alias + ' ' + name + ' ' + slot, FKParent_Rack__ID : parent, Rack_Type: 'Slot', Movable: 'N', Rack_Full: 'N', Capacity: '1' };
                slotData.push(data);
                // console.log("Slot " + slot + " = " + JSON.stringify(data));
              }

            }

            // console.log("Insert slot data: " + JSON.stringify(slotData));
            Record.createNew('Rack', slotData, {}, payload)
            .then ( function (slotResult) {
              var box = boxResult.insertId;
              var slots = slotResult.affectedRows;
              
              var msg = "Added Box [#" + box + "] with " + slots + ' Slots'
              deferred.resolve({box: boxResult, slots: slotResult, message: msg});
            })
            .catch (function (err) {
              err.context = 'creating slots';
              deferred.reject(err);
            });
          })
          .catch ( function (err) {
            err.context = 'creating box';
            deferred.reject(err);
          });
        }
        else {
          var err = new Error;
          err.message = 'no rack alias found';
          err.context = 'addSlottedBox';
          deferred.reject(err);
        }
      })
      .catch ( function (err) {
        err.context('addSlottedBox');
        deferred.reject(err);
      });
    }

    return deferred.promise;
  },

  add : function add (options, payload) {
    if (!options) { options = {} }

    var deferred = q.defer();

    var parent = options.parent;
    var type = options.type;
    var name = options.name;

    var names = Record.cast_to(name, 'array');

    var reset = {};
    reset['FKParent_Rack__ID'] = parent;
    reset['Rack_Name'] = [];
    reset['Rack_Alias'] = [];
    reset['Rack_Type'] = type;
    
    var ids = [];

    for (var i=0; i<names.length; i++) {
      reset['Rack_ID'] = null;
      reset['Rack_Name'].push(names[i]);
      reset['Rack_Alias'].push("<Parent.Rack_Alias> " + names[i]);
      ids.push(parent);
    }
      
    Record.clone('rack', ids, reset, { id: 'Rack_ID' }, payload)
    .then (function (result) {
      console.log("Cloned rack:  " + JSON.stringify(result));
      deferred.resolve(result);
    })
    .catch (function (err) {
      err.context = 'cloning rack';
      deferred.reject(err);
    });

    return deferred.promise;
  },

  move : function move (ids, parent, options, payload) {
    // currently only moving boxes ... 
    // if extended to move Racks and/or shelvse, progeny must be updated for more than one generation below (separate into separate method to execute recursively)
    
    if (!options) { options = {} }
    var names = options.names || [];
    var reprint = options.reprint;
    var timestamp = options.backfill_data || options.timestamp;

    var deferred = q.defer();

    Record.query_promise("Select Rack_Alias as alias from Rack where Rack_ID = " + parent)
    .then ( function (result) {
      var parent_alias = result[0].alias;
      var aliases = names.map( function (name) {
        return parent_alias + ' ' + name;
      });

      console.log("update rack alias to point to " + parent_alias);

      Record.update('rack', ids, { FKParent_Rack__ID: parent, Rack_Name: names, Rack_Alias: aliases }, null, payload)
      .then ( function (result) {
        console.log("MOVED: " + JSON.stringify(result));

        var promises = [];
        for (var i=0; i<ids.length; i++) {
          var name = " CASE WHEN Rack_Type != 'Slot' THEN CONCAT( Concat('" + aliases[i] + "',' '), Rack_Name) ";
          name += " ELSE CONCAT( Concat('" + aliases[i] + "',' '), LOWER(Rack_Name)) END";

          promises.push( Record.query_promise("UPDATE Rack SET Rack_Alias = " + name + " WHERE FKParent_Rack__ID = " + ids[0]) );
        }

        q.all(promises)
        .then( function (ok) {
          console.log("Updated progeny names as well");
          deferred.resolve(result);
        })
        .catch ( function (err) {
          console.log("Error updateing progeny");
          deferred.reject(err);
        });

        // Refactor save history ... 

        
        // Change_history.update_History('rack', ids, { FKParent_Rack__ID: parent, Rack_Name: names})
        // .then (function (ok) {
        //   deferred.resolve(result);
        // })
        // .catch ( function (err) {
        //   console.log("Error logging history for rack movement");
        //   deferred.resolve(result);
        // });

      })
      .catch ( function (err) {
        console.log("Err: " + err);
        deferred.reject(err);
      });
    })
    .catch ( function (err2) {
      console.log("Error retrieving parent alias");
      deferred.reject(err2);
    });

    return deferred.promise;
  },

  transferLocation : function transferLocation (model, ids, target_rack, options, payload) {
    // Transfer samples to a new box... similar to moveSamples but with some extra optoions like 'create' flag or target 'wells' array
    var deferred = q.defer();

    if (!options) { options = {} }

    var wells = options.wells || [];
    var pack = options.pack;
    var create = options.create;

    if (pack ) {
      Rack.boxContents({ id: target_rack })
      .then ( function (result) {
        if (result.available && result.available[target_rack] && result.available[target_rack].length >= ids.length) {
          for (var i=0; i<ids.length; i++) {
            wells.push(result.available[i].position);
          }

          options.wells = wells;

          if (create) {
            // Create racks and then move them ... 
            Rack.add({size: create, type: 'Box'})
            .then ( function (added) {
              var target = added.target; // test
              Rack.moveSamples(model, ids, target, options,payload)
              .then ( function (res) {
                deferred.resolve(res);
              })
              .catch ( function (err) {
                deferred.reject(err);
              });              
            })
            .catch ( function (err) {
              deferred.reject(err);
            });
          }
          else {
            // Move to existing target rack 
            var target = target_rack;
            Rack.moveSamples(model, ids, target, options, payload)
            .then ( function (res) {
              deferred.resolve(res);
            })
            .catch ( function (err) {
              deferred.reject(err);
            });
          }
        }
        else {
          var e = new Error("not enough wells available");
          console.log("Found " + result.available[target_rack].length + ' - need ' + ids.length);
          deferred.reject(e);
        }
      })
      .catch ( function (err) {
        err.context = 'retrieving box Contents for Rack: ' + target_rack;
        deferred.reject(err);
      });
    }
    else {
      var e = new Error('non pack not yet set up');
      deferred.reject(e);
    }

 
    return deferred.promise;
  },

  moveSamples : function moveSamples (model, ids, target_rack, options, payload) {

    var deferred = q.defer();

    if (!options) { options = {} }

    var wells = options.wells;
    var mirror = options.mirror;
    var unsorted = options.unsorted;

    var Mod = sails.models[model];
    if (wells && Mod) {
      if (ids.length == wells.length) {
        var promises = [];
        var idField = Record.alias(model, 'id');
        
        for (var i=0; i<wells.length; i++) {
          var update =  "Update " + model + ", Rack SET  FK_Rack__ID = Rack.Rack_ID "
            + " WHERE Rack.FKParent_Rack__ID =" + target_rack + " AND Rack_Name = '" + wells[i] 
            + "' AND " + idField + ' = ' + ids[i]; 
          promises.push( Record.query_promise(update) );
        }

        q.all()
        .then ( function (result) {
          deferred.resolve({ success: true});
        })
        .catch (function (err) {
          deferred.reject(err);
        });

        console.log("packing into specified sections");      
        deferred.resolve({ success: true});        
      }
      else {
        var e = new Error("different length noticed between well list and id list");
        deferred.reject(e);
      }
    }
    else if (mirror) {
      console.log("please supply wells if preserving rack location");
      var e = new Error("must supply wells if preserving rack location");
      deferred.reject(e);
    }
    else if (unsorted) {
      // move all ids into the same location
      console.log("Move " + ids.length + ' ' + model + ' records onto Rack ' + target_rack);
      var query = "Update " + model + " SET FK_Rack__ID = " + target_rack + " WHERE " + model + '_ID IN (' + ids.join(',') + ")";
      Record.query_promise(query)
      .then (function (result) {
        deferred.resolve({ success: true, result: result});
      })
      .catch ( function (err) {
        err.context = 'moving samples';
        deferred.reject(err)
      });
    }
    else {
      console.log("unspecific distribution strategy");
      var e = new Error('unspecified distribution strategy');
      deferred.reject(e);
    }

    return deferred.promise;

  },

  boxContents : function (options) {

    var deferred = q.defer();

    var tables = ['Rack'];
    var fields = ['count(*) as Count', 'Rack.Rack_Name as slot', 'Rack.Rack_ID as id', 'Rack.FKParent_Rack__ID as box_id', 'Rack.Rack_Type'];
    if (!options) { options = {} }

    var rack_id = options.id;
    var rack_name = options.name;
    var rack_alias = options.alias;
    var conditions = options.conditions || [];
    var fill_by = options.fill_by || 'row';
    var rows = options.rows;
    var columns = options.columns;

    console.log("options: " + JSON.stringify(options));
    console.log("Rows: " + JSON.stringify(rows));
    var content_types = ['Plate','Solution'];
    
    var rack_ids;
    if (rack_id && rack_id.constructor === Number) { rack_ids = [ rack_id.toString() ] }
    else if (rack_id && rack_id.constructor === String && rack_id.match(/[a-zA-Z]/)) {
      var Scanned = Barcode.parse(rack_id);
      console.log("Scanned: " + JSON.stringify(Scanned));
      
      if (Scanned.Errors && Scanned.Errors.length) {
        deferred.reject(Scanned.Errors);
      }

      rack_ids = Scanned['Rack'];
    }
    else if (rack_id && rack_id.constructor === Array) {
      rack_ids = rack_id;
    }
    else if (rack_id && rack_id.match(/,/) ) {
      rack_ids = rack_id.split(/\s*,\s*/);
    }
    else if (!rack_id) {
      console.log("No Rack ID supplied");
    }
    else {
      rack_ids = [rack_id];
    }

    console.log("Rack: rack_id / rack_name");
    // Box specific conditions //
    conditions.push("Rack.Rack_Type = 'Slot'");

    if (rack_ids && rack_ids.length) {
      tables.push('Rack as Parent');
      fields.push('Parent.Rack_Name as box_name');
      fields.push('Parent.Rack_Alias as box_alias');
      conditions.push("Parent.Rack_ID=Rack.FKParent_Rack__ID");
      conditions.push("Rack.FKParent_Rack__ID IN (" + rack_ids.join(',') + ')');
    }
    else if (rack_name) {
      tables.push('Rack as Parent');
      fields.push('Parent.Rack_Name as box_name');
      fields.push('Parent.Rack_Alias as box_alias');

      conditions.push("Parent.Rack_ID=Rack.FKParent_Rack__ID");
      conditions.push("Parent.Rack_Name = '" + rack_name + "'");
    }
    else if (rack_alias) {
      tables.push('Rack as Parent');
      fields.push('Parent.Rack_Name as box_name');
      fields.push('Parent.Rack_Alias as box_alias');
      conditions.push("Parent.Rack_ID=Rack.FKParent_Rack__ID");
      conditions.push("Parent.Rack_Alias = '" + rack_name + "'");      
    }
    else {
      conditions.push('0');
      deferred.reject("No rack conditions specified");
    }

    if (rows) {
      var row_options = rows.join("','");
      conditions.push("Left(Rack.Rack_Name,1) IN ('" + row_options + "')")
    }
    if (columns) {
      var column_options = columns.join("','");
      conditions.push("Mid(Rack.Rack_Name,2,2) IN ('" + column_options + "')")
    }

    var left_joins = [];

    for (var i=0; i<content_types.length; i++) {
      var content_type = content_types[i]; 
      left_joins.push(content_type + " ON " + content_type + ".FK_Rack__ID=Rack.Rack_ID");
      fields.push("GROUP_CONCAT(" + content_type + "_ID) AS " + content_type);
    }

    var order = [];
    if (fill_by === 'unsorted') {}
    else if (fill_by === 'row') {
      order.push( 'LEFT(Rack.Rack_Name,1)');
      order.push( 'CAST(Mid(Rack.Rack_Name,2,2) AS UNSIGNED)');
    }
    else if (fill_by == 'column') {
      order.push( 'CAST(Mid(Rack.Rack_Name,2,2) AS UNSIGNED)');      
      order.push( 'LEFT(Rack.Rack_Name,1)');
    }
    else {
      console.log("need to specify fill by column or row (or unsorted)");
    }
      
    var query = Record.build_query({tables: tables, fields: fields, left_joins: left_joins, conditions: conditions, group: ['Rack.Rack_ID'] , order: order });
    
    console.log("GET Rack Contents");
    console.log("options: " + JSON.stringify(options));
    console.log(query);
    Record.query_promise(query)
    .then ( function (data) {
 
      // console.log(JSON.stringify(data));

      var contained = {};
      var available = {};
      var boxes = [];

      if (data.length) {
        var contentData = {
          id : data[0].box_id,
          name : data[0].box_name,
          slot : data[0].slot,
          alias : data[0].box_alias
        };
        boxes.push( data[0].box_id);

        for (var i=0; i<data.length; i++) {
          var boxid = data[i].box_id;
          var id    = data[i].id;

          if (boxes.indexOf(boxid) === -1) { boxes.push(boxid) }

          if (!available[boxid]) { available[boxid] = [] }

          var position = data[i].slot;

          for (j=0; j<content_types.length; j++) {
            var type = content_types[j];
            if (data[i][type]) {
              var contains = data[i][type];
              if (!contained[boxid]) { 
                contained[boxid] = {}
              }
              if (! contained[boxid][position]) { contained[boxid][position] = {} }
              contained[boxid][position][type] = contains;
            }
          }
          if (! ( contained[boxid] && contained[boxid][position]) )  { 
            available[boxid].push( { id: id, position: position.toUpperCase()} );
          }

        }

        // console.log("Contains: " + JSON.stringify(contained));
        // console.log("Available: " + JSON.stringify(available));
        
        contentData['contains'] = contained;
        contentData['available'] = available;

        if (rack_ids && rack_ids.length > 1) {
          boxes = Record.restore_order(boxes, rack_ids);
        }
        contentData['boxes'] = boxes;

        deferred.resolve(contentData);
      }
      else {
        deferred.resolve({});
      }
      
    })
    .catch ( function (err) {
      console.log("Error: " + err);
      deferred.reject(err);
    });	

    return deferred.promise;
  }
};

