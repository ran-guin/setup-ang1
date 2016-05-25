/**
* Recommendation.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    attributes: {
        vaccine : {
            'model' : 'vaccine'
        },

        disease : {
            'model' : 'disease'
        },

        recommendation : {
            'type' : 'text',
            'enum' : ['Mandatory','Recommended','Optional','Discouraged'] 
        },

        region : {
            'model' : 'region'
        },
    },


    load : function (input, cb) {

        var treatments = input.treatments;
        var patient_id = input.patient_id;

       // Generate Vaccine / Disease Protection Map 
        var q = "SELECT vaccine as vaccine_id, vaccine.name as vaccine_name, disease as disease_id, disease.name as disease_name from protection, vaccine, disease where vaccine=vaccine.id and disease=disease.id"
        Record.query(q, function (err, protection) {
//        Protection.find()
//        .populate('disease')
//        .populate('vaccine')
//        .exec ( function (err, protection) {

            if (err) { return {Error: err} }
                
            var Diseases = {};
            var Vaccines = {};
            for (var i=0; i<protection.length; i++) {
                var disease = protection[i].disease_name;
                var vaccine = protection[i].vaccine_name;

                if (Diseases[vaccine] == undefined) { Diseases[vaccine] = [] }
                if (Vaccines[disease] == undefined) { Vaccines[disease] = [] }
                Diseases[vaccine].push(disease);
                Vaccines[disease].push(vaccine);
            }

            var data = {};  

            data.protectionMap = { Diseases : Diseases, Vaccines : Vaccines };

            var q = "SELECT vaccine as vaccine_id, vaccine.name as vaccine_name, disease as disease_id, disease.name as disease_name, recommendation from recommendation, vaccine, disease where vaccine=vaccine.id and disease=disease.id"


            Recommendation.query(q, function (err, recommendations) {
                var schedule = [];
                for (var i=0; i < recommendations.length; i++) {
                    var D = recommendations[i].disease_name;
                    var V = recommendations[i].vaccine_name;
                    var DID = recommendations[i].disease_id;
                    var VID = recommendations[i].vaccine_id;
                    var rec = recommendations[i].recommendation;

                    var found = 0;
                    for (j=0; j<treatments.length; j++) {
                        var vaccine = treatments[j].vaccine.name;
                        var against = data.protectionMap.Diseases[vaccine];
                        Dfound = against.indexOf(D);
                        if (Dfound >=0) { found++ }
                    }

                    if (!found) { 
                        schedule.push( {
                            disease: { id: DID, name: D}, 
                            vaccine: { id: VID, name: V}, 
                            patient: patient_id,
                            recommendation : rec,

                        } );
                        console.log(D + ' not treated');
                    }
                    else {
                        console.log(D + ' Treated with ' + V);
                    }
                
                }

                data['schedule'] = schedule;
                console.log("Schedule: " + JSON.stringify(schedule));

                cb(null, data);
            }); 
        });
    }              
};

