var app = angular.module('myApp');

app.factory('CommonFactory', function($rootScope, $http){
  var service = {};

  service.Lookup = [];
  service.AttributePrompt = [];

  /** Load Lookup Table **/
  service.loadLookup = function (url, table, options) {

    if (! options ) { options = {} } 
    var model = options.model || table;
    var elementId    = options.elementId || table;   // optional elementId to replace table 

    var prompt = options.prompt || 'Select';
    var def = options.default;
    var condition = options.condition || '';
    console.log("URL: " + url);
    
    if (prompt) { url = url + "prompt=" + prompt + '&'}
    if (condition) { url = url + "condition=" + condition }

	console.log('load lookup table for ' + table + ' : ' + model );

        if ( this.Lookup[elementId]) {
          console.log('already loaded ' + elementId );
        }
        else if ( elementId ) {  
            this.Lookup[elementId] = {};   

            /** use reference that will be populated when available **/
            var lookup = {options : null, value : null};

            console.log('call: ' + url);
            $http.get(url)
            .success ( function (response) {
                var options = response;
                
                console.log("Loaded Lookup successfully: ");
                //console.log(JSON.stringify(options));

                document.getElementById('Lookup-' + elementId ).innerHTML=response;

/*
                lookup.options = options;

                var index = 0;
                if (def) {
                    for (var i=0; i< options.length; i++) {
                        if (options[i]['elementId'] == def) { 
                            index = i;
                            break;
                        }
                    }
                    console.log("Default to " + def + ' -> ' + index);
                    lookup.value = { 'elementId' : options[index]['elementId'], 'label' : options[index]['label']};
                }
*/
                $rootScope.$broadcast('loadedLookup', { table : table, elementId : elementId, model : model});
            })
            .error ( function (response) {
                console.log("Error loading " + table + " Lookup HTTP request");
            });

            this.Lookup[elementId] = lookup; 
 
        }
        else { console.log("no lookup table specfied") }
  }

  service.loadAttributePrompt = function (url, model, attribute, label, def) { 
        if (!model) { model = table }
        console.log('load ' + attribute + ' Attribute for ' + model );

        if ( ! this.AttributePrompt[model]) { this.AttributePrompt[model] = {} }

        if ( this.AttributePrompt[model][attribute]) {
          console.log('already loaded ' + model + " : " + attribute );
        }
        else if ( model && attribute) {  
            this.AttributePrompt[model][attribute] = {};   

            /** use reference that will be populated when available **/
            var AttributePrompt = {options : null, value : null};

            console.log('call: ' + url);
            $http.get(url)
            .success ( function (response) {
                var options = response;
                
                console.log("Loaded " + model + ': ' + attribute + " Attribute successfully: ");
                console.log(JSON.stringify(options));

                var el = document.getElementById(model + '-' + attribute );
                if (el) { el.innerHTML=response }
                else { console.log("could not locate " + model + '-' + attribute + " element") }

                $rootScope.$broadcast('loadedAttributePrompt', { model : model, attribute : attribute });
            })
            .error ( function (response) {
                console.log("Error loading " + model + ': ' + attribute + " Attribute HTTP request");
            });

            this.AttributePrompt[model][attribute] = AttributePrompt; 
 
        }
        else { console.log("no Attribute specfied") }
  }

  return service;
});
