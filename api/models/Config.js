/**
 * Config.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var q = require('q');

module.exports = {

  attributes: {

  },

  printer_groups : function() {

  	return Printer_group.printer_groups() 
  	
  	// var deferred = q.defer();
  	// deferred.resolve(pg);

  	// return deferred.promise;
  }


};

