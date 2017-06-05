/**
 * CdcController
 *
 * @description :: Server-side logic for managing cdcs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    
    side_effects : function (req, res) {
        // Example of API calls that should access centralized (CDC / WHO ?) database
        //
       
        console.log('api - retrieve side_effects');

        var vaccine = req.param('vaccine');

        var query = ""; // SELECT Side_Effects, Contraindications, Notes, Bulletins for vaccine(s)

        var example = {
            'vaccine' : vaccine,
            'side_effect' : 'Headache',
            'severity'    : 'Severe',
            'probability' : '75%',
        };

        res.send([example]);
    },

    contraindications : function (req, res) {
        // Example of API calls that should access centralized (CDC / WHO ?) database
        //
        
        console.log('api - retrieve contraindications');

        var vaccine = req.param('vaccine');

        var query = ""; // SELECT Side_Effects, Contraindications, Notes, Bulletins for vaccine(s)

        var example1 = {
            'vaccine' : vaccine,
            'risk_condition' : 'Pregnancy',
            'degree' : 'Critical'
        };
        
        var example2 = {
            'vaccine' : vaccine,
            'risk_condition' : 'Transplant Patient',
            'degree' : 'Critical'
        };

        res.send([example1, example2]);
    },
    
    indications : function (req, res) {
        // Example of API calls that should access centralized (CDC / WHO ?) database
        //
        
        console.log('api - retrieve indications');
        
        var vaccine = req.param('vaccine');
        var risk_factor = req.param('risk');
    
        var query = ""; // SELECT Side_Effects, Contraindications, Notes, Bulletins for vaccine(s)

        var example1 = {
            'risk_factor' : 'Animal bite',
            'description' : 'Bites from dogs, bats, raccoons or rodents are indications for rabies shots unless the animal is available for testing and deemed free of rabies',
            'vaccine' : 'Rabies',
            'recommendation' : 'Critical'
        };
        
        res.send([example1]);
    },

    travel : function (req, res) {
        // Example of API calls that should access centralized (CDC / WHO ?) database
        //
        
        console.log('api - retrieve travel recommendations');
        
        var vaccine = req.param('vaccine');
        var region = req.param('Region');

        var query = ""; // SELECT Side_Effects, Contraindications, Notes, Bulletins for vaccine(s)

        var example1 = {
            'risk_factor' : 'Travel',
            'vaccine' : 'Yellow Fever',
            'region' : 'Guyana',
            'recommendation' : 'Critical'
        };
        
        var example2 = {
            'risk_factor' : 'Travel',
            'vaccine' : 'Ebola',
            'description' : 'most countries in East Africa pose a risk.  Specifically: Ivory Coast, Liberia, Sierra Leone and Burkina Faso',
            'region' : 'East Africa',
            'recommendation' : 'Recommended'
        };

        res.send([example1, example2]);
    },
    
    risks : function (req, res) {
       
        console.log('api - retrieve risk factors');
        
        var example = ['Animal Bite', 'Pregnancy', 'Travel'];

        res.send(example);
    },

    regions : function (req, res) {
        
        console.log('api - retrieve regions');
        
        var example = [
            { region : 'North America', 'country' : 'Canada'},
            { region : 'North America', 'country' : 'United States'},
            { region : 'North America', 'country' : 'Mexico'},
            { region : 'Canada', country : 'Canada' },
            { region : 'BC', country : 'Canada' },
            { region : 'Okanogan', country : 'Canada' },
            { region : 'Northern BC', country : 'Canada', description : 'coastal areas north of Prince Rupert' },
            { region : 'South America', country : '', description : 'all countries in south america' },
            { region : 'Central America', country : '', description : 'all countries in central america' },
            { region : 'East Africa', country : '', description : 'all countries in east africa' },
        ];
        
        res.send(example);
    },

};

