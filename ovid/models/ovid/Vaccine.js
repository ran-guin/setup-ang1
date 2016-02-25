/**
* Vaccine.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName     : 'vaccine',

  attributes: {
   // The name of the disease ... eg "Yellow Fever"
    name: {
      type: 'string',
      required: true,
      unique: true,
    },

    code: {
    	type: 'string',
    	required: true,
    	unique: true,
    },
    
    defaultRoute: {
                type: 'string',
                enum: ['IM - Intramuscular', 'SC - Subcutaneous','ID - Intradermal', 'IN - Intranasal', 'PO - Oral']
    },
 
/*
    // alternative name (array ?)  ## eg "yellow jack"
    alias: {
    	type: 'array',

    }
*/
    // A text descriptions
    description: {
      type: 'email',
    },

    // A link to the cdc data page
    // 
    infoLink: {
      type: 'string',
    },

    // Special attributes 
    // attributes below MAY (?) be separated based upon target group (eg different dose info for kids & adults)

    recommendedDosage: {
    	type: 'int',
    },

    recommendedDosageUnits: {
    	type: 'string',
    	enum: ['mg','ml']
    },

    effectiveMonths: {
    	type: 'int',
    },

    minDoseInterval: {
    	type: 'int'
    },

    recommendationLevel: {
    	type: 'string',
    	enum: ['Critical', 'Highly Recommended', 'Recommended', 'Optional', 'Location Specific', 'Not Recommended']
    },

    targetGroup: {
    	type: 'string',
    	enum: ['Infants','Children','Adults']
    },

    diseases: {
      collection: 'disease',
      via: 'vaccines',
      through: 'protection',
    },

    // Side effects & ContraIndications in separate table ? (or local if using noSQL)
  }
};

