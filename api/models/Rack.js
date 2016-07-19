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
    return 1; 
  },

  addSlottedBox : function addSlottedBox (parent, name, size) {

    var deferred = q.defer();

    var wells = Rack.wells[size];
    if (! wells || !name || !size) {
      deferred.reject("not standard size ? " + size);
    }
    else {

      Record.query_promise("Select Rack_Alias from Rack where Rack_ID = " + parent)
      .then (function (result) {
        if (result.length == 1) {
          var alias = result[0]['Rack_Alias'];

          var boxData = [ { Rack_Name: name, Rack_Alias: alias + ' ' + name, FKParent_Rack__ID : parent, Rack_Type: 'Box', Movable: 'Y', Rack_Full: 'N', Capacity: size }]
          
          Record.createNew('Rack', boxData)
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

            console.log("Insert slot data: " + JSON.stringify(slotData));
            Record.createNew('Rack', slotData)
            .then ( function (slotResult) {
              var box = boxResult.insertId;
              var slots = slotResult.affectedRows;
              
              var msg = "Added Box #" + box + " with " + slots + ' Slots'
              deferred.resolve({box: boxResult, slots: slotResult, message: msg});
            })
            .catch (function (err) {
              deferred.reject(err);
            });
          })
          .catch ( function (err) {
            deferred.reject(err);
          });
        }
        else {
          deferred.reject('no rack alias found');
        }
      })
      .catch ( function (err) {
        deferred.reject("problem getting parent info");
      });
    }

    return deferred.promise;
  },

  add : function add (options) {
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
      
    Record.clone('rack', ids, reset, { id: 'Rack_ID' })
    .then (function (result) {
      console.log("Cloned rack:  " + JSON.stringify(result));
      deferred.resolve(result);
    })
    .catch (function (err) {
      console.log("Error cloning rack: " + JSON.stringify(err));
      deferred.reject(err);
    });

    return deferred.promise;
  },

  transferLocation : function transferLocation (model, ids, target_rack, options) {
    // Transfer samples to a new box... similar to moveSamples but with some extra optoions like 'create' flag or target 'wells' array
    var deferred = q.defer();

    if (!options) { options = {} }

    var wells = options.wells || [];
    var pack = options.pack;
    var create = options.create;

    if (pack ) {
      Rack.boxContents(target_rack)
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
              Rack.moveSamples(model, ids, target, options)
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
            Rack.moveSamples(model, ids, target, options)
            .then ( function (res) {
              deferred.resolve(res);
            })
            .catch ( function (err) {
              deferred.reject(err);
            });
          }
        }
        else {
          deferred.reject("not enough wells available.  Found " + result.available[target_rack].length + ' - need ' + ids.length);
        }
      })
      .catch ( function (err) {
        console.log("Error retrieving box Contents for Rack: " + target_rack + " : " + err);
        deferred.reject(err);
      });
    }
    else {
      deferred.reject('non pack not yet set up');
    }

 
    return deferred.promise;
  },

  moveSamples : function moveSamples (model, ids, target_rack, options) {

    var deferred = q.defer();

    if (!options) { options = {} }

    var wells = options.wells;
    var mirror = options.mirror;
    var unsorted = options.unsorted;

    var Mod = sails.models[model];
    if (wells && Mod) {
      if (ids.length == wells.length) {
        var promises = [];
        var idField = Mod.alias('id') || 'id';
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
        deferred.reject("different length noticed between well list and id list");
      }
    }
    else if (mirror) {
      console.log("please supply wells if preserving rack location");

      deferred.reject({success: false});
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
        deferred.reject("Error moving samples: " + err)
      });
    }
    else {
      console.log("unspecific distribution strategy");
      deferred.reject("unspecified distribution strategy");
    }

    return deferred.promise;

  },

  boxContents : function (rack_id, conditions, options) {

    var deferred = q.defer();

    var tables = ['Rack'];
    var fields = ['count(*) as Count', ' Rack_ID', 'FKParent_Rack__ID', 'Rack_Name', 'Rack_Type'];

    if (!conditions) { conditions = [] }
    if (! options ) { options = {} }

    var fill_by = options.fill_by || 'row';

    var content_types = ['Plate','Solution'];
    
    var rack_ids;
    if (rack_id.constructor === Number) { rack_id = rack_id.toString() }

    console.log("supplied : " + rack_id.constructor + " = " + rack_id);
    if (rack_id.constructor === String && rack_id.match(/[a-zA-Z]/)) {
      var Scanned = Barcode.parse(rack_id);
      console.log("Scanned: " + JSON.stringify(Scanned));
      rack_id = Scanned['Rack'];
    }

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

    var order = [];
    if (fill_by === 'unsorted') {}
    else if (fill_by === 'row') {
      order.push( 'LEFT(Rack_Name,1)');
      order.push( 'CAST(Mid(Rack_Name,2,2) AS UNSIGNED)');
    }
    else if (fill_by == 'column') {
      order.push( 'CAST(Mid(Rack_Name,2,2) AS UNSIGNED)');      
      order.push( 'LEFT(Rack_Name,1)');
    }
    else {
      console.log("need to specify fill by column or row (or unsorted)");
    }
      
    var query = Record.build_query({tables: tables, fields: fields, left_joins: left_joins, conditions: conditions, group: ['Rack_ID'] , order: order });

    Record.query_promise(query)
    .then ( function (data) {
 
      console.log(query);
      console.log(JSON.stringify(data));

      var contained = {};
      var available = {};
      for (var i=0; i<data.length; i++) {
        var boxid = data[i].FKParent_Rack__ID;
        var id    = data[i].Rack_ID;

        if (!available[boxid]) { available[boxid] = [] }

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
        if (! ( contained[boxid] && contained[boxid][position]) )  { 
          available[boxid].push( { id: id, position: position.toUpperCase()} );
        }

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

