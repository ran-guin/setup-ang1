/**
* Travel.js
*
* @description ::  This tracks travel plans for patients to enable notifications & recommendations for regionally applicable vaccinations
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      patient: {
          model: 'patient'
      },
      region: {
          model: 'region'
      },
      start: {
          type: 'date'
      },
      finish: {
          type: 'date'
      }
  }
};

