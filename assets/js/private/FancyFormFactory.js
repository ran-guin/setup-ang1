var app = angular.module('myApp');

app.factory('FancyFormFactory', function($rootScope, $http){
  var service = {};

  service.Lookup = [];
  service.AttributePrompt = [];

  /** Load Lookup Table **/
  service.loadLookup = function (url, model, options) {

    if (! options ) { options = {} } 
    var table = options.table || model;
    var elementId    = options.elementId;   // optional elementId to replace table 

    var prompt = options.prompt;
    var def = options.default;
    var condition = options.condition || '';
    var field = options.field;   // enables application to enum field lookups 
    var defaultTo = options.default;
    
    if (prompt) { url = url + "prompt=" + prompt + '&'}
    if (condition) { url = url + "condition=" + condition + '&' }
    if (defaultTo) { url = url + 'default=' + defaultTo + '&' }
    if (field ) { 
        url = url + "field=" + field + '&'
        elementId = elementId || field;
    }
    else {
        elementId = elementId || table;
    }

    console.log("URL: " + url);

    console.log(elementId + ' load lookup table for ' + table + ' : ' + model );

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

                var el = document.getElementById('Lookup-' + elementId );
                if (el) { el.innerHTML=response }
                else { console.log("Could not find element: Lookup-" + elementId) }

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
