/**
 * TeaController
 *
 * @description :: Server-side logic for managing teas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  
  blackTea: function(req, res) {

  	var links = [
  		{ label : 'Black Tea', href: '/teas/black-tea' }
  	];

	return res.render('nokcha/black-tea', { links: links, links_title: 'Black Tea Varieties'} );
  }	
};

