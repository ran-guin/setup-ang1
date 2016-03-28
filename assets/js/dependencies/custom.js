
$(document).ready(function() {
    
    setTimeout(function sunrise () {
	// *** final color for header animation *** //
          var h1 = document.getElementsByClassName('header');
          if (h1.length > 0) { h1[0].style.backgroundColor = '#238' }
    }, 0);  
    
    setTimeout(function sunrise () {
	// *** final color for header animation *** //
          var h2 = document.getElementsByClassName('mini-header');
          if (h2.length > 0) { 
            h2[0].style.backgroundColor = '#238';
            h2[0].style.padding = '5px 50px 5px 100px';
          }
    }, 0);  
    
    setTimeout(function sunrise () {
	// *** final color for header animation *** //
          var h3 = document.getElementsByClassName('grow-header');
          if (h3.length > 0) {
            h3[0].style.backgroundColor = '#238';
            h3[0].style.padding = '90px';
          }
    }, 0);  
    
    
    $('#searchResults').DataTable();


} );

