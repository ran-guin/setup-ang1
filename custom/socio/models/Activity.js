/**
 * Activity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    parent: { 
    	type: 'int'
    },    

    status: {
      type: 'string',
      enum: ['inactive','pending', 'active'],
      defaultsTo: 'pending',
    },

    // url for gravatar
    gravatarUrl: {
      type: 'string'
    },

    members: {
      collection: 'user',
      via: 'activities'
    }
  }
};

