var app = angular.module('myApp');

app.factory('Nto1Factory', function ($rootScope, $http) {
  var service = {};

  service.items = [];
  service.include = {};
  service.pendingChanges = [];
  service.Columns = [];

  service.Autocomplete = [];
  service.Shown = [];
  service.SearchOn = [];
  service.Hidden = [];

  service.attributes = [];
  service.item_attributes = [];

  service.Fields = [];
  service.itemFields = [];

  service.Set = {};
  service.Map = {};
  service.Type = {};

  service.itemSet = {};
  service.itemMap = {};
  service.itemReset = {};

  service.Lookup = [];

  service.highlightClass = '';
  service.highlight = {};

  service.updatedModel = '';
 
  service.timediff = function (t1, t2, format) {
      var wait = moment().diff(moment(t1), 'minutes');
      var hours = wait/60;

      if ( hours >  24 ) {
        
        var days = hours/24;
        hours = hours - days*24;

        wait = parseInt(days) + " days ";
        if (hours > 0) { wait = wait +  parseInt(hours) + ' hour(s)' }
      }
      else if ( wait > 60 ) {
        var minutes = wait - hours*60;

        wait = parseInt(hours) + " Hours " + parseInt(minutes) + ' minute(s)';
      }
      else { wait = wait + ' minute(s)' }

      return wait;
  }

  service.pad2 = function (int) {
    if (int < 10) { int = '0' + int.toString() }
    return int;
  }

  /** Expand scope attributes to simplify original specifications **/
  service.extend_Parameters = function (Columns, itemColumns, autocomplete) {

    this.attributes = ['user', 'userid', 'url'];
    console.log('Extend ' + Columns.length + ' Column Details');
    for ( var i=0; i < Columns.length; i++) {
        var col = Columns[i];
        var field = col['field'];
        var label = col['label'] || field;
        var type  = col['type'] || 'string';
        var set = col['set'];
        var target = col['target'] || field;

        this.attributes.push(label);
        this.Map[label] = field;
        this.Type[label] = type;
        if (set) { this.Set[label] = target }

        if (label) { this.Fields.push(field + ' AS ' + label) }
        else { this.Fields.push(field) }
    }

    console.log('Extend ' + itemColumns.length + ' Item Details');

    for ( var i=0; i < itemColumns.length; i++) {
        var col = itemColumns[i];
        var field = col['field'];
        var label = col['label'] || field;
        var type  = col['type'] || 'string';
        var set = col['set'];
        var target = col['target'] || field;
        var search = col['search'];

        var model = label; // .replace(/[_ ]/,'');
        var mandatory = col['mandatory'] || 0;
        var hidden = col['hidden'] || 0;
        var id = col['id'] || field;
        var autocomplete_on = 1;

        var attributes = { id : id, type : 'text', placeholder : '-- ? --'};

        if (label) { this.itemFields.push(field + ' AS ' + label) }
        else { this.itemFields.push(field) }
        
        if (mandatory) 
          attributes['mandatory'] = 1;
        if (model)
          attributes['ng-model'] = model;
        if (autocomplete_on) {
          attributes['data-autocomplete'] = "field:" + field + ";";
          if (type)
            attributes['data-autocomplete'] += "type:" + type + ';'; 
        }

        // console.log('autocomplete options: ' + attributes['data-autocomplete']);

        itemColumns[i]['id'] = label || id;
        itemColumns[i]['placeholder'] = '-- ? --';
        itemColumns[i]['autocomplete'] = attributes['data-autocomplete']
        itemColumns[i]['att'] = attributes;
        
        if (label && model) {
            var param = '';
            for (var key in attributes) {
                param += ' ' + key + "='" + attributes[key] + "'";
            }
            // this.itemColumns[i]['Xattributes'] = attributes;
            itemColumns[i]['parameters'] = param;
        }

        // if (hidden) {
        //     itemColumns[i]['parameters'] = "id = '" + id + "' type='text' placeholder='-- ? --' data-autocomplete= 'field: " + field;
        //     this.Hidden.push(itemColumns[i]);
        //     // console.log('Hide ' + id);
        // }
        // else {
        //     itemColumns[i]['parameters'] = "id = '" + id + "' type='hidden'";
        //     this.Shown.push(itemColumns[i]);
        //     // console.log('Show ' + id);
        // }

        // if(autocomplete && autocomplete['search'].match('/' + label + '/')) {
        if (autocomplete['search']) {
          // console.log('add autocomplete options ' + autocomplete['search'] + ':' + label);
        }

        label_regex = new RegExp('\\b' + label + '\\b');
        field_regex = new RegExp('\\b' + field + '\\b');

        if (autocomplete && autocomplete['search']) {
          if (autocomplete['search'].match(label_regex) || autocomplete['search'].match(field_regex)) {
            this.SearchOn.push(itemColumns[i]);
          }
        }

        if (autocomplete && autocomplete['hide']) {
          if (autocomplete['hide'].match(label_regex) || autocomplete['hide'].match(field_regex)) {
            itemColumns[i]['parameters'] = "id = '" + id + "' type='text' placeholder='-- ? --' data-autocomplete= 'field: " + field;
            this.Hidden.push(itemColumns[i]);
          }
        }

        this.item_attributes.push(label);
        
        this.itemMap[label] = field;

        if (col['set']) { this.itemSet[label] = target }
        if (col['reset']) { this.itemReset[label] = field }
    }

    if (autocomplete) {
      autocomplete['query'] = "SELECT DISTINCT " + autocomplete['query_field'];
      autocomplete['query'] += " FROM " + autocomplete['query_table'];
      autocomplete['query'] += " WHERE " + autocomplete['query_condition'];

      autocomplete['displayBlock'] = 'message';
      autocomplete['dataKey'] =  'data';
      autocomplete['token'] =  autocomplete['token'] || 'undefWebToken';

      this.Autocomplete = autocomplete;
    }

    $rootScope.$broadcast('parametersExtended');

  },

  /** Enable Highlighting at various stages **/
  service.setClasses = function (keys, value) {
      var default_class = '';
      var highlightClass = 'form-group has-error text-warning';
      this.highlightClass = highlightClass;

      for (var i=0; i<keys.length; i++) { 
        key = keys[i];
        key = key.replace(/\s/g,'');
        if (value == keys[i]) { this.highlight[key] = highlightClass }
        else { this.highlight[key] = '' }
      }
      $rootScope.$broadcast('setClasses');
  }

  /** Load Lookup Table **/
  service.loadLookup = function (url, table, model, def) { 
        console.log('load lookup table for ' + table + ' : ' + model );
        if (!model) { model = table }

        if ( this.Lookup[table]) {
          console.log('already loaded ' + table );
        }
        else if ( table ) {  
            this.Lookup[table] = {};   

            /** use reference that will be populated when available **/
            var lookup = {options : null, value : null};

            console.log('call: ' + url);
            $http.get(url)
            .success ( function (response) {
                var options = response;
                
                console.log("Loaded Lookup successfully: ");
                console.log(options);
                lookup.options = options;

                var index = 0;
                if (def) {
                    for (var i=0; i< options.length; i++) {
                        if (options[i]['id'] == def) { 
                            index = i;
                            break;
                        }
                    }
                    console.log("Default to " + def + ' -> ' + index);
                    lookup.value = { 'id' : options[index]['id'], 'label' : options[index]['label']};
                }
       
                $rootScope.$broadcast('loadedLookup', { table : table, model : model});
            })
            .error ( function (response) {
                console.log("Error loading " + table + " Lookup HTTP request");
            });

            this.Lookup[table] = lookup; 
 
        }
        else { console.log("no lookup table specfied") }
  }

  service.loadAttribute = function (name, list) {
        console.log('reset list');
        this[name] = list;
  }

  /********** Add Item to List  **********/
  service.addItem = function( columnData, currentItems, scope) {
        if (currentItems) { this.include[scope] = currentItems }
          
        console.log('smart add item in service ' + typeof currentItems);

        // var Columns = JSON.parse(columnData);
        var Columns = columnData;
        
        var thisitem = {};
        var populate = {};
        
        for ( var index in Columns) {
            var col = Columns[index];
            var fld = col['field'];
            var elId = col['label'] || fld;
            var label = col['label'] || fld;
            var table = col['table'];
            var ngKey = label; // .replace(/[_ ]/,'');

            var regex = table + '\.';
            fld = fld.replace(regex,'');

            if (table && scope && (table != scope) ) {
              if ( thisitem[table] === undefined ) { thisitem[table] = {} }
              if (this[table]) {
                // not typically used... 
                thisitem[table][ngKey] = this[table][ngKey];
              }
            }
            else {
              thisitem[ngKey] = this[ngKey];  // initialize to existing attribute
            }

            this[ngKey] = '';
            var el = document.getElementById(elId);
            if (el) { 
              if ( table && scope && (table != scope) ) {
                // use actual field name for populated model attributes
                thisitem[table][fld] = el.value;  
              }
              else {
                // use label for standard attributes
                thisitem[ngKey] = el.value;                
              }
              console.log(ngKey + " (re)Set to " + el.value)
              el.value = '';
            }
        }

        var add = {};

        console.log("Added " + scope  + ": " + JSON.stringify(thisitem));

        if (scope) { 
          if ( this.include[scope] == undefined ) { this.include[scope] = [] }
          add[scope] = thisitem;
          this.include[scope].push( add[scope] );
        }
        else { 
          add = thisitem;
          this.include.push(add)
        }

        console.log('added item via service for ' + scope);
        
        service.updatedModel = scope;
       
        $rootScope.$broadcast("listUpdated");
        service.notePendingChange("Added Item(s)");    
  }

  
  service.notePendingChange = function (message) {
    this.pendingChanges.push(message);
    console.log("noted pending change: " + message);
  }

  return service;
});
