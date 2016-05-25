/**
 * PatientController
 *
 * @description :: Server-side logic for managing patients
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    loadHistory: function (req, res) {
        var patient_id = req.param('id');
        console.log("Load patient history for patient " + patient_id);

       Patient.loadHistory({'patient_id' : patient_id}, function (err, result) {           
            if (err) {  return res.negotiate(err) }

            if (!result) {
              console.log('no patient results');
              return res.send('');
            }
            
            console.log("RESULT:" + JSON.stringify(result));

            res.send(result);
        });
    }
};

