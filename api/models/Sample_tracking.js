/**
* Sample_tracking.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	Rack : { model : 'rack' },
  	Container : { model : 'container'},
  	Moved_from  : { model : 'rack' },
  	Moved_to  : { model : 'rack' },
  	moved : { type : 'datetime' },
  	Moved_by : { model : 'user' }
  },

  


};

