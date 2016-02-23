'use strict';

var app = angular.module('myApp');

app.controller('AppointmentController', 
    ['$scope', '$rootScope', '$http', '$q', 'Nto1Factory',
    function appointmentController ($scope, $rootScope, $http, $q, Nto1Factory) {

    console.log('loaded appointment controller');        
    $scope.context = 'Appointment';

    $scope.debugMode = false;

    $scope.testMessage = {
       text: 'hello world!',
       time: new Date()
    };
    
    var start = moment([2007, 0, 5]);
    var end   = moment([2007, 0, 10]);
    $scope.tester = end.to(start);       // "5 days ago"

    /** run PRIOR to standard initialization  */
    $scope.setup = function (config) {
        $scope.$parent.setup(config);

        $rootScope.itemClass = 'treatment';
        $rootScope.mainClass = 'appointment';
        
        $rootScope.statusField = 'status';
        $rootScope.statusDefault = 'In Process';

        /* Customize as Required */

        $rootScope.statusOptions = ['Scheduled', 'Waiting', 'In Process', 'Cancelled', 'Completed'];
 
        $scope.Columns = [
            { field : 'clinic.id', set: 1},
            { field : 'clinic.name' },
            { field : 'clinic.address' },
            { field : 'user.name', label : 'Vaccinator'},
            { field : 'user.id', label : 'VaccinatorId', set: 1},
            { field : 'patient' },
            { field : 'patient.name' },
            { field : 'patient.birthdate' },
            { field : 'appointment.id', label: 'appointment_id'},
        ];

        $scope.itemColumns = [
            { field : 'vaccine.id', table: 'vaccine', label: 'vaccine', set: 1, mandatory : 1, hidden:1},
            { field : 'vaccine.name', table: 'vaccine', label: 'Vaccine'},
            { field : 'disease.id', table: 'disease', label: 'disease_id', set: 1, mandatory : 1, hidden:1},
            { field : 'disease.name', table: 'disease', label: 'Disease'},
            { field : 'treatment.id', table: 'treatment', label: 'treatment_id'},
            { field : 'site'},
            { field : 'route'},            
            { field : 'lot'},
            { field : 'status'},
            { field : 'notes'},
            { field : 'treatment.id', hidden: 1},
            { field : 'contraindication.condition', label: 'Contraindications' },
            { field : 'side_effect.name', label:'known_side_effect'},
            { field : 'recommendationLevel', label: 'recommendation'}
       ];
    
        /* Load Fields based on fields above using tables / condition below */
        $scope.queryTables = "(clinic, appointment, patient, staff, user)";
        var leftJoins = [
            'treatment ON treatment.appointment_id=appointment.id',
            'vaccine ON treatment.vaccine_id=vaccine.id',
            'contraindication ON contraindication.vaccine_id=vaccine.id',
            'side_effect ON side_effect.vaccine_id=vaccine.id',
        ];
        if (leftJoins.length) {
            $scope.queryTables += ' LEFT JOIN ' + leftJoins.join(' LEFT JOIN ');
        }
        
        $scope.queryCondition = "appointment.clinic=clinic.id AND appointment.patient=patient.id AND appointment.staff=staff.id AND staff.user_id=user.id";
   
        $scope.Autocomplete = {
            url : '/api/search',
            token : $scope.token,
            view: 'appointment/Appointment',
            target : 'Vaccine',
            show : "Vaccine, Disease",
            search : "Vaccine, Disease",
            hide: 'id, vaccine, disease_id',

            query_table : "(vaccine,  protection, disease)",
            query_field : "vaccine.id as vaccine, disease.id as disease_id, disease.name as Disease, vaccine.name as Vaccine",
            query_condition : "protection.disease=disease.id and protection.vaccine=vaccine.id",
            
            // query : "SELECT DISTINCT User_Name,Request_Date,Item_Request_ID,Item_Category_Description,Unit_Qty,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name, CASE WHEN Unit_Cost IS NULL THEN Item_Cost ELSE Unit_Cost END as Unit_Cost,Item_Request_Notes,Deliver_To, Item_Request_Notes FROM (Item, Item_Request, Request, User) JOIN Item_Category ON FK_Item_Category__ID=Item_Category_ID LEFT JOIN Vendor ON Vendor_ID=FK_Vendor__ID WHERE FK_Request__ID=Request_ID AND FKRequester_User__ID=User_ID AND FK_Item__ID=Item_ID AND Request_ID=FK_Request__ID",
            set : "vaccine, disease_id, Vaccine, Disease",
            // condition : "FK_Item_Category__ID IN (<Item_Category>)",
            onEmpty : "No Vaccine found.<P><div class='alert alert-warning'>Please try different spellings or different field to search.<P>Please only add a new item if this item has never been received before.  <button class='btn btn-primary' type='button' data-toggle='modal' data-target='#newPatientModal'> Add New Patient </button></div>\n"
        };

        console.log($scope.Autocomplete['url'] + " + " + $scope.token);
         
        Nto1Factory.extend_Parameters($scope.Columns, $scope.itemColumns, $scope.Autocomplete);

        $scope.$parent.setup(config);
    }

    $scope.initialize = function( config ) {
        
        console.log("appointment initialization...");
        $q.when($scope.setup(config))
        .then ( function () {
            console.log('initialize appointment with ' + $scope.itemClass);
        })
        .then ( function () {
            console.log('initialized appointment with ' + $scope.itemClass);
            $scope.$parent.initialize(config);
        })
        .then ( function (res) {
            $scope.ac_options = JSON.stringify($scope.Autocomplete);
        });
    }

    $scope.syncLookup = function (attribute, id, label) {
      console.log("sync " + attribute);
      console.log(JSON.stringify($scope[attribute]));
      $rootScope[id] = $scope[attribute]['id'];
      $rootScope[label] = $scope[attribute]['label'];
    }

    $scope.loadRecommendations = function (data) {
        console.log('load recommendations');
        
        $http.get("/recommendation" + '?token=' + $scope.token)
        .success ( function (response) {
            $rootScope['recommendation'] = response;
            console.log("got recommendations: " + JSON.stringify(response));
        });
        
    }

    $scope.loadPatientHistory = function (patient_id, attr) {
        console.log("Retrieve patient " + patient_id + " History");
        $http.get('/patient/history/' + patient_id)
        .success ( function (response) {
                console.log("Retrieved History");

                $rootScope.patient_history = response;
                console.log("HIST: " + JSON.stringify($scope.patient_history)); 

                if (attr) { $rootScope[attr] = response }
            })
            .error (function (error) {
                console.log("Error loading history");
                console.log(error);
            });


    }

    /********** Add Item to List of Requests **********/
    $scope.addItem = function () {
        console.log("INCLUDE: "  + $scope.itemClass + " : " + JSON.stringify($scope.include.treatment.length));
        var index = $scope.include['treatment'].length;

        Nto1Factory.addItem( $scope.itemColumns, $scope.include.treatment, 'treatment' );

        console.log('added treatment...' + JSON.stringify($scope.include.treatment));

        $rootScope.include['treatment'][index].status = 'Requested';

        $scope.postAdd('treatment', index);  // show past reactions ... 
    }

    $scope.postAdd = function (model, index, vaccine) {

        var vaccine_id = $scope.include[model][index].vaccine;
        console.log("load history of reactions to " + model + ' with ' + vaccine_id);
/*
        $http.get('/vaccine/side_effects/' + vaccine_id)
        .success ( function (response) {
                console.log("Retrieved History");

                $rootScope.patient_history = response;
                console.log("HIST: " + JSON.stringify($scope.patient_history)); 

                if (attr) { $rootScope[attr] = response }
            })
            .error (function (error) {
                console.log("Error loading history");
                console.log(error);
            });
*/

        $scope.include[model][index].ReactionHistory = 'Past History..';
        $scope.include[model][index].Contraindications = 'Pregnant Women';
        $scope.include[model][index].known_side_effect = 'Nausea';
    }

    $scope.addBarcodedVaccine = function () {
        var barcode = document.getElementById('barcode');
        console.log("Barcode: " + barcode);

        var ids = $scope.loadExamples(['Scanned','Scanned'],[null,null], ['Recommended','Mandatory for Region'],1);

        $scope.scanned_barcode = "AWG12312ABsadfajkl";

        for (var i=0; i<ids.length; i++) {
            $rootScope.include['treatment'].push(ids[i]);

            var data = ids[i];
/*
            $http.put("/treatment/" + ids[i] + "?token=" + $scope.token, JSON.stringify(data))
            .then ( function (res) {
                console.log("Updated status for  " + ids[i]);
            });
*/
            console.log("Data: " + JSON.stringify(data));
        }
 
    }

    $scope.loadPatient = function (id) {
        $rootScope.patient = {};
        $rootScope.patient.id = id;
    }

// move to ClinicController only ... 
    $scope.loadQueue = function () {
        console.log("LOAD QUEUE");
        var queueExample = [
            {
                appointment_id: 1,
                name: 'Ryan Reynolds',
                age: 55,
                gender: 'M'
            },
            {
                appointment_id: 2,
                name: 'Brenda Reynolds',
                age: 35,
                gender: 'F'
            },            

        ];

//        $http.get(url + '/clinic/queue')

        $rootScope.queued = queueExample;
    }

    $scope.loadScheduledVaccinations = function () {
        console.log("Retrieve suggested vaccinations from CDC API (?)");
 
        $scope.loadExamples(['Scheduled','Scheduled'], ['due','overdue'],['Recommended','Mandatory for Region'],0);
    }

    $scope.loadExamples = function (status, due, recommendation, replace) {

        var ids = [];

        var example1 = {
            'Disease' : 'HepA',
            'Vaccine' : "HepA-HepB",
            'lot' : '1234',
            'known_side_effect' : "Nausea",
             'due' : due[0],
            'recommendation' : recommendation[0],
            'vaccine' : 24,
            'status' : status[0],
            'appointment_id' : $scope.appointment_id, 
            'defaultRoute' : 'IM - Intramuscular',
            'patient' : $scope.patient.id,
       };
        
        //ids.push( $scope.applyVaccine(example1, replace) );

        var example2 = {
            'Disease' : 'Yellow Fever',
            'Vaccine' : "Monkeypox",
            'known_side_effect' : "Nausea",
            'Contraindications' : 'Pregnancy',
            'due' : due[1],
            'recommendation' : recommendation[1],
            'vaccine' : 28,
            'status' : status[1],
            'appointment_id' : $scope.appointment_id,
            'defaultRoute' : 'IM - Intramuscular',
            'patient' : $scope.patient.id,
        };


        //ids.push( $scope.applyVaccine(example2, replace) );
        return [example1, example2];
    }

    $scope.applyVaccine = function (vaccine, replace) {

        var alreadyTracked = null;

        var data = {
            'vaccine' : vaccine['vaccine_id'],
            'status' : vaccine['status'],
            'appointment' : vaccine['appointment_id'],
            'route' : vaccine['defaultRoute'],
            'patient' : vaccine['patient'],
        };

        for (var i=0; i<$scope.include['treatment'].length; i++) {
            console.log("Compare " + $scope.include['treatment'][i]['Vaccine'] + ' with ' + vaccine['Vaccine']);
            if ($rootScope.include['treatment'][i]['Vaccine'] == vaccine['Vaccine']) {
                alreadyTracked = i;
            }
        }

        if (alreadyTracked == null) {
            console.log("Add new vaccine: " + JSON.stringify(vaccine));
            $rootScope.include['treatment'].push(vaccine);
            
            console.log("Post to database (treatment): " + JSON.stringify(data));
            
            var config = { headers : { 'token' : $scope.token }};

            $http.post("/treatment", JSON.stringify(data), config)
            .then ( function (response) {
                console.log("added to database");
                var index = $scope.include['treatment'].length - 1;
                $rootScope.include['treatment'][index].id = response['id'];
                return index;
            });

        }
        else if (replace) { 
            console.log("Replace item " + alreadyTracked);
            var keys = Object.keys(vaccine);
            for (var i= 0; i<keys.length; i++) {
                // eg.. maintain due/overdue status if scanned...
                if (vaccine[keys[i]] == null) { vaccine[keys[i]] = $scope.include['treatment'][alreadyTracked][keys[i]] }  
            }
            $rootScope.include['treatment'][alreadyTracked] = vaccine;
 
            var treatment_id = $scope.include['treatment'][alreadyTracked].id;

            console.log("update database (treatment) " + treatment_id + ": " + JSON.stringify(data));
            if ($scope.treatement_id) {
                console.log("updated treatment " + $scope.include['treatment'][alreadyTracked].id );
                $http.put("/treatment/" + treatment_id , JSON.stringify(data))
                .then ( function (response) {
                    console.log("updated database");
                    return alreadyTracked;
                });
            }
        }

    }

    $scope.loadRecord = function (recordId) {
        var fields = $scope.Fields.join(',');
        var itemfields = $scope.itemFields.join(',');
        $rootScope.customQuery = "Select " + fields + ',' + itemfields;
        $rootScope.loadCondition = $scope.mainClass + "_ID = '" + recordId + "'";

        $rootScope.customQuery += " FROM " + $scope.queryTables + " WHERE " + $scope.queryCondition + ' AND ' + $scope.loadCondition;

        console.log($scope.customQuery);
        var url = '/api/q';
        console.log('preload from ' + url);

        /* implement promise */
        var promise =  $scope.$parent.loadRecord(url, recordId, $scope.customQuery);
        $q.when(promise)
        .then ( function (res) {
            // $scope.loadCostCentre();
            $scope.loadNextStatus();
            Nto1Factory.setClasses($scope.statusOptions, $scope.recordStatus); 
            console.log('apply user  ' + $scope.user);

            $scope.updateTotals();
            $rootScope.highlightBackground = "background-color:#9C9;";

        });

    }


    $scope.saveChanges = function (status) {
        var data = {

         };         

        var jsonData = JSON.stringify(data);
        var url = '/api/update/' + $scope.mainClass + '/' + $scope.recordId;

        $q.when ($scope.$parent.saveChanges(url, jsonData))
        .then ( function () {
            $scope.loadRecord($scope.recordId);
            console.log('reload ' + $scope.recordId);
            // Nto1Factory.setClasses($scope.statusOptions, $scope.recordStatus);  
        });

    }

    /********** Save Request and List of Include['treatment'] Requested **********/
    $scope.createRecord = function() {
            console.log("Post " + $scope.mainClass);

            for (var i=0; i<$scope.include['treatment'].length; i++) {

            }

            var data = { 
                'FKDesk_User__ID' : $scope.userid, 
                'Queue_Creation_Date' : $scope.timestamp,
                'FK_appointment__ID' : $scope.appointment_ID,
                'Queue_Status' : 'Active',
                'items' : $scope.include['treatment'],
                'map'   : $scope.itemSet,
            }; 

            var jsonData = JSON.stringify(data);
            var url = "/queue/create";
            $q.when($scope.$parent.createRecord(url, jsonData))
            .then ( function (response) {
                console.log('got response');
                console.log(response);

                console.log(JSON.stringify($scope.createdRecords));
                var created = $scope.createdRecords[$scope.createdRecords.length-1];
                $rootScope.recordId = created['id'];

                var link = "Queue #" + $scope.recordId + ' created : ' + created['description']
                console.log('created Queue # ' + $scope.recordId);
                
                $scope.clearScope();
                $rootScope.mainMessage = link;
                // $('#topMessage').html(link);

            });           
    }

}]);
