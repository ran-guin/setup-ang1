var app = angular.module('myApp',['ngFileUpload']);

app.controller('FancyFormController', 
    ['$scope', '$q', '$rootScope', '$http', '$location', 'FancyFormFactory', 'Upload', 
    function ($scope, $q, $rootScope, $http, $location, FancyFormFactory, Upload) {
        console.log('loaded Fancy Form Controller');
        
        // Support Basic Password Validation and Confirmation
        // usage: ng-model='repeat' ng-key-up="compare(repeat)"
        $scope.stdForm = {};
        $scope.stdForm.units = {
            'ul' :  1/1000,
            'ml' : 1,
            'ug' : 1/1000000,
            'mg' : 1/1000,
            'g'  : 1
        };

        $scope.stdForm.units_options = [
            {id: 0, name: '-- Units --'},
            {id : 1, name : 'ul'},
            {id : 2, name : 'ml'},
            {id : 3, name : 'ug'},
            {id : 4, name : 'mg'},
            {id : 5, name : 'g'}
        ];

        $scope.stdForm.units_lookup = $scope.stdForm.units_options[0].name;

        $scope.custom_disable = false;

        $scope.testUnique = function (element, model, field) {
            console.log("CHECK UNIQUENESS");
            
            if (! field) { field = element }   // default to same name as element 

            var url = "/remote_login/validate?model=" + model + '&value=' + $scope[element] + '&field=' + field;
            console.log("URL: " + url); 
            $http.get(url)
            .then ( function (result) {
                console.log("Got " + JSON.stringify(result.data));
                if (result.data && result.data[0] && result.data[0].count) {
                    var msg = $scope[element] + " is already used.  (" + element + " must be unique) ";
                    $scope.warnings.push(msg);
                    $scope[element + '_errors'] = msg;
                    $scope.custom_disable = true; 
                    console.log("Conflict");
        		}
        		else { 
                    console.log("no conflict"); 
                    $scope[element + '_errors'] = false;
                    $scope.custom_disable = false;
                }
    	    })
            .catch ( function (err) {
                $scope.warnings.push('could not confirm uniqueness');
            })
        }

        $scope.passwordValidation = /^[a-zA-Z]\w{3,14}$/;
        $scope.confirmedPassword = false;
        $scope.compare = function (repeatEntry) {
            console.log("Compared " + repeatEntry + " with " + $scope.password);
            $scope.confirmedPassword = $scope.password == repeatEntry ? true : false;
            if ($scope.confirmedPassword) { document.getElementById('confirm_password').style="color:green" }
        }

    	$scope.padded = function (view) {
    		return view;
    		//return "\n<div class='container' style='padding:20px'>\n" + view + "</div>\n";
    	}

        $scope.set_dropdown_default = function (name, label, target_name) {
            for (var i=0; i<$scope[name].length; i++) {
                if ($scope[name][i].name === label) {
                    $scope[target_name] = i;
                }

            }
        }

        $scope.get_List = function (type, condition) {

            var deferred = $q.defer();
            
            var enums = type.match(/^ENUM\('(.*)'\)$/i);
            var ref   = type.match(/^FK[\_\(](.+)(__ID|\))/);
            
            var list = [];
            if (enums) {
                var options = enums[1]  ;
                list = options.split(/'?\s*,\s*'?/);
                console.log("Enums: " + list.join(', '));
                deferred.resolve(list);
            }
            else if (ref) { 
                console.log("reference dropdown: " + JSON.stringify(ref[1]));
                var reference = ref[1]; // .replace(/^FK[\_\(]/,'').replace(/(__ID|\))$/,'');
                console.log('get list from reference: ' + reference);
                
                var url = '/lookup/' + reference + '?';
                if (condition) { url = url + 'condition=' + condition }

                console.log("get lookup for " + reference);
                console.log(url);
                $http.get(url)
                .then ( function (result) {
                    console.log("R: " + JSON.stringify(result));
                    var list = result.data;
                    var options = [];
                    for (var i=0; i<list.length; i++) {
                        options.push( { id: list[i].id, name: list[i].label } );
                    }
                    console.log("OPTIONS: " + JSON.stringify(options));
                    deferred.resolve(options);
                })
                .catch ( function (err) {
                    console.log("GET error...");
                    console.log(err);
                    options = [{}];
                    deferred.reject(err);
                });
            }
            else { 
                options = type;
                list = options.split(/'?\s*,\s*'?/);
                console.log("Simple List: " + list.join(', '));
                deferred.resolve(list);
            }

            return deferred.promise;
        }

        $scope.setup_Menu = function (element, enumType, condition, defaultTo) {
            // convert ENUM('A','B','C') to dropdown menu ... 
            //
            // Usage example (jade):
            //
            //  select( 
            //    ng-model='xyz' 
            //    ng-init="setup_Menu('xyz', \"EN\UM('A','B','C')\", 'B')" 
            //    ng-options="item.id as item.name for item in MenuList['xyz']"
            //  )
            
            // var defaultVal = ''; 

            // var deferred = $q.defer();

            console.log("Generate enums for " + enumType);

            $scope.get_List(enumType, condition)
            .then ( function (list) {          
                
                if ( ! $scope.MenuList ) { $scope.MenuList = {} }
                $scope.MenuList[element] = [];

                if (list && list[0] && list[0].constructor === Object ) {
                    $scope.MenuList[element] = list;
                    console.log(element + " object list = " + JSON.stringify(list));
                }
                else if (list && list[0] ) {
                    for (var i=0; i<list.length; i++) {
                        var id = i+1;
                        id = id.toString();
                        $scope.MenuList[element].push( { id: id, name: list[i] });
                        console.log(element + " array list = " + JSON.stringify(list));
                        
                    }
                }

                if ( defaultTo && defaultTo === list[i]) {
                    //defaultVal = $scope.MenuList[element][ $scope.MenuList[element].length-1][ref];
                    //$scope[element] = { id: id, name: list[i] };
                }

                //$scope[element] = $scope.MenuList[element][ref];
                // console.log(JSON.stringify( $scope.MenuList ));
                // console.log(element + " DEFAULT = " + JSON.stringify($scope[element]));

                // $scope[element] = defaultVal;
                console.log("DROPDOWN LIST: " + JSON.stringify( $scope.MenuList ));
                console.log("default to " + JSON.stringify($scope[element]));

            })
            .catch ( function (err) {
                console.log("Error generating enum list: " + err);

            });
        }

        $scope.setElement = function (element, val) {
            $scope[element] = val;
            console.log("El: " + element + ' -> ' + val);
            $scope.tqu = null;
            $scope.tqu = 'ul';
            $scope.transfer_qty_units = 'ul';
        }

        $scope.$watch("tqu", function (value) {
            $scope['transfer_qty_units'] = $scope.tqu;
        }); 

        // Automatically Load Lookup Files //
        $scope.loadLookup = function loadLookup(model, labels, prompt, condition, defaultTo) {
            console.log("Lookup for " + model);
            var specs = model.split(':');

            var options = {};
            if (specs.length > 1) {
                // reference fields using format: model:field (eg Rack:Capacity)
                model = specs[0];
                field = specs[1];
                url = "/enum/" + model;

                options.field = field;
            }
            else {
                url = "/lookup/" + model + '/';

               if ( labels ) { 
                    url = url + labels;   // defaults to "id:name:label"
                    options.label = labels;
                }
    
                if (condition) {
                    options.condition = condition;
                }
            }

        	if (prompt) {
        		options.prompt = prompt;
        	}

            if (defaultTo) {
                options.default = defaultTo;
            }

            
        	url = url + '?render=1';
            console.log("Call factory lookup with url: " + url + ':' + JSON.stringify(options));
            var got = FancyFormFactory.loadLookup(url, model, options);

       		console.log("Loaded " + model + " Lookup Table");
    	}

        $scope.loadAttributePrompt = function loadAttributePrompt(model, attribute, label, defaultTo) {
        
        	var url = "/attribute/" + model + '/' + attribute + '/';

       		var got = FancyFormFactory.loadAttributePrompt(url, model, attribute, label, defaultTo);

       		console.log("Loaded " + model + ': ' + attribute + " attribute prompt");
    	}

        $scope.setup = function( config ) {

	    }

	    $scope.setField = function (field, value) {
	    	console.log("SET " + field + ' to ' + value);
	    	$scope[field] = value;
	    }

        $scope.updateLookup = function ( lookup ) {
            var model = lookup + '-id';

            var el1 = document.getElementById(model);

            if (el1) {
                $scope[lookup] = el1.value;
                $scope[lookup + '_id'] = el1.value;
                console.log('sync ' + lookup + ' to lookup value: ' + el1.value);
            }
            else {
                console.log("Warning: Could not find " + model + " element to synchronize");
            }
             
            var el2 = document.getElementById(lookup + '-label');

            if (el2) {
                $scope[lookup + '_label'] = el2.value;
                console.log('sync ' + lookup + '_label to  ' + el2.value);
            }
            else {
                console.log("Warning: Could not find " + model + " element to synchronize");
            }
        }

        $scope.updateLookups = function () {
            var lookups = document.getElementsByClassName('lookupMenu');
            for (var i=0; i<lookups.length; i++) {
                console.log("update " + JSON.stringify(lookups[i]));
                var identifier = lookups[i].id;
                $scope.updateLookup(identifier); 
            }
        }

        $scope.colours = [ { name: 'Red'}, { name:'White'} , {name: 'Blue'}];
        $scope.colour = ''; // {name: 'Blue'};

}])
.directive('myDatepicker', function ($parse) {
   return {
      restrict: "AEC",
      replace: true,
      transclude: false,

      // template: 'Name: {{customer.name}} Address: {{customer.address}}',

      compile: function (element, attrs) {
         var modelAccessor = $parse(attrs.ngModel);

         var html = "<input class='input-lg' type='text' id='" + attrs.id + "' >" +
            "</input>";

         var newElem = $(html);
         element.replaceWith(newElem);

         
         return function (scope, element, attrs, controller) {

            var processChange = function () {

                var defaultDate = element.datepicker("getDate");
                var date;

               // if default date is '' or 0, then new Date() returns 1970-01-01... so avoid this... 
               if (defaultDate) { date = new Date(defaultDate) }
               else { date = new Date() }

               scope.$apply(function (scope) {
                  // Change bound variable
                  modelAccessor.assign(scope, date);
               });
            };

            element.datepicker({
               dateFormat : 'yy-mm-dd',
               inline: true,
               onClose: processChange,
               onSelect: processChange
            });

            scope.$watch(modelAccessor, function (val) {
               var date;

                if (val) { date = new Date(val) }

                element.datepicker("setDate", date);
            });

         };
         
      }

   };
})
.run(function($rootScope) {
    angular.element(document).on("click", function(e) {
        $rootScope.$broadcast("documentClicked", angular.element(e.target));
    });
})
.directive("dropdown", function($rootScope) {

    // usage : 
    //
    //  may preset attribute in controller if desired:  $scope.options = [ { id: 0, name: 'option 1'}, { id: 2, name: 'option 2'}]
    //
    // dropdown(placeholder="Select..." list="options" selected="#{fld}#{Snum}" property="name"  (note: list uses ng-attribute options)
    // additional attribute options: 
    //     track='name'  (sets value to name in hash)  (property only controls the displayed value)
    //     default='option 2'  ( need to set whole model if track is not set, since item is the selected object)
    //     
    //  for auto-generating dropdowns from enums or FK_refs, you can initiate the dropdown using:
    //
    // ng-init="setup_Menu('#{model}','#{type}') 
    //  
    // 
    //  eg dropdown(placeholder='pick..' list="MenuList['colours']" default='Blue' track:name property:name
    //         ng-init="set_Dropdown('colours',\"ENUM('Red','Blue','Green')\"))
    return {
        restrict: "AEC",
        // templateURL: "templates/dropdown.html,
        template: " \
            <div class=\"dropdown-container\" ng-class=\"{ show: listVisible }\"> \
                <div class=\"dropdown-display\" ng-click=\"show();\" ng-class=\"{ clicked: listVisible }\"> \
                    <input class=\"placeholder input-lg\" ng-if=\"isPlaceholder\" style=\"padding: 5px; width:100%\" ng-model=\"search\" ng-keypress=\"filter($event)\" type=\"text\" placeholder =\"{{placeholder}}\"><\/input> \
                    <input class=\"placeholder input-lg\" ng-show=\"!isPlaceholder\" style=\"border: 0px; padding: 5px; width:100%\" ng-model=\"search\" ng-keypress=\"filter($event)\" type=\"text\" placeholder =\"{{display}}\"><\/input> \
                    <i class=\"fa fa-angle-down\"><\/i> \
                <\/div> \
                <div class=\"dropdown-list\"> \
                    <div> \
                        <div ng-repeat=\"item in list\" ng-click=\"select(item)\" ng-keypress=\"filter($event)\" ng-class=\"{ selected: isSelected(item) }\"> \
                            <span>{{property !== undefined ? item[property] : item}}<\/span> \
                            <i class=\"fa fa-check\"><\/i> \
                        <\/div> \
                    <\/div> \
                <\/div> \
            <\/div>",
        scope: {
            placeholder: "@",
            list: "=",
            selected: "=",
            property: "@",
            track: '@',
            default: '@',
        },
        link: function(scope) {
            scope.listVisible = false;
            scope.isPlaceholder = true;
           
            if (scope.default) {
                scope.selected = scope.default;
                console.log(" Set default to " + scope.selected)
            }
            else {
                console.log("no default for " + scope.placeholder + ' ' + scope.track);
            }

            scope.select = function(item) {
                scope.isPlaceholder = false;
                if (scope.track) { scope.selected = item[scope.track] }
                else { scope.selected = item }  // or just item for full object

                scope.label = item[scope.property];
            };

            scope.filter = function(event) {
                console.log("E: " + event);
                var key = window.event ? event.keyCode : event.which;
                if (key) {
                    var keyval = String.fromCharCode(key);
                
                    console.log("K: " + keyval);
                    for (var i=0; i<scope.list.length; i++) {
                        if ( scope.list[i].name.charAt(0).toLowerCase() == keyval.toLowerCase() ) {
                            console.log(keyval.toLowerCase() + ' = ' + scope.list[i].name.charAt(0).toLowerCase());
                            scope.select(scope.list[i]);
                            i = scope.list.length;
                        }
                    }
                    scope.search = '';
                    listVisible=true;
                    console.log('open list');
                }
                else {
                    scope.choose();
                    scope.search = '';
                    scope.listVisible = false;
                    console.log('close list');
                }
            };

            scope.isSelected = function(item) {
                if (scope.track) {
                    return item[scope.track] === scope.selected;
                }
                else if (scope.selected) {
                    return item[scope.property] === scope.selected[scope.property];
                }
                else { return false }
            };

            scope.show = function() {
                scope.listVisible = true;
                console.log('show list');

            };

            scope.choose = function (value) {
                if (scope.track) { 
                    scope.isPlaceholder = (scope.selected === undefined || ! scope.selected);
                    // scope.display = scope.label;
                }
                else if (scope.selected) { 
                    scope.isPlaceholder = scope.selected[scope.property] === undefined;
                    // scope.display = scope.selected[scope.property];
                }
                else {
                    scope.isPlaceholder = true;
                }
                
                scope.display = scope.label;

                console.log('reset display to ' + scope.display);
                console.log("selected: " + JSON.stringify(scope.selected) + ' : ' + scope.property);
                scope.search = '';
            };

            $rootScope.$on("documentClicked", function(inner, target) {
                console.log($(target[0]).is(".dropdown-display.clicked") || $(target[0]).parents(".dropdown-display.clicked").length > 0);
                if (!$(target[0]).is(".dropdown-display.clicked") && !$(target[0]).parents(".dropdown-display.clicked").length > 0)
                    scope.$apply(function() {
                        scope.listVisible = false;
                        console.log('closed on click list');

                    });
            });

            scope.$watch("selected", function(value) {
                scope.choose(value);
            });
        }
    }
})
.directive('autocomplete', ['$http', function($http) {
    return function (scope, element, attrs) {
        element.autocomplete({
            minLength:3,
            source:function (request, response) {
                var url = "/Record/search";

                if (attrs.search) {                    
                    var table = attrs.search;
                    var label = 'name';
                    if (attrs.search.match(/:/) ) {
                        var params = attrs.search.split(':');
                        table = params[0];
                        label = params[1];
                    }
                    
                    var searchScope = {};
                    searchScope[table] = [label, 'id'];

                    var params = { scope : searchScope, search : request.term};
                    // params = { scope : scope, search : request.term };

                    console.log('post search ' + table + ' : ' + url);
                    console.log(JSON.stringify(searchScope));
                    
                    $http.post(url, params)
                    .success ( function(data) {
                        console.log("GOT: " + JSON.stringify(data));
                        response(data.results);
                    })
                    .error ( function (err) {
                        console.log("Error: ");
                    });
                }
                else {
                    console.log("no search parameters");
                }
            },
            focus:function (event, ui) {
                element.val(ui.item.name);
                return false;
            },
            select:function (event, ui) {
                // scope[attrs.ngModel].selected = ui.item.id;
                console.log('set ' + attrs.ngModel + ' id to ' + ui.item.id + ": " + ui.item.name);

                // scope[attrs.ngModel].id = ui.item.id;
                var label = attrs.label || 'name';
                var track = attrs.track || 'id';

                if (attrs.ngModel.match(/\./)) {
                    var model = attrs.ngModel.split('.');
                    scope[model[0]][model[1]] = ui.item[label];
                    scope[model[0]][model[1] + '_id'] = ui.item[track];
                }
                else {
                    scope[attrs.ngModel] = ui.item[label];
                    scope[attrs.ngModel + '_id'] = ui.item[track];
                }
                // scope.myModel = ui.item;
                // scope.myModelId.selected = ui.item.id;
                scope.selected    = ui.item;

                scope.$apply();
                return false;
            },
            change:function (event, ui) {
                if (ui.item === null) {
                    // scope.myModelId.selected = null;
                
                    // scope[attrs.ngModel] = null;
                    scope[attrs.ngModel + '_id']    = null;
                    scope.selected = null;
                    console.log('clear');
                }
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            return $("<li class='input-lg'></li>")
                .data("item.autocomplete", item)
                .append("<a class='input-lg'>" + item.name + "</a>")
                .appendTo(ul);
        };
    }
}]);
