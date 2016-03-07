var app = angular.module('myApp');

app.factory('CommonFactory', function($rootScope, $http){
  var service = {};

  service.Lookup = [];

  /** Load Lookup Table **/
  service.loadLookup = function (url, table, model, def) { 
        if (!model) { model = table }
	    console.log('load lookup table for ' + table + ' : ' + model );

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
                console.log(JSON.stringify(options));

                document.getElementById('Lookup-Lab_Protocol').innerHTML=response;

/*
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
*/
                $rootScope.$broadcast('loadedLookup', { table : table, model : model});
            })
            .error ( function (response) {
                console.log("Error loading " + table + " Lookup HTTP request");
            });

            this.Lookup[table] = lookup; 
 
        }
        else { console.log("no lookup table specfied") }
  }

  return service;
});
