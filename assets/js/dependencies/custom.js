
$(document).ready(function() {
    
    setTimeout(function sunrise () {
	// *** final color for header animation *** //
          document.getElementsByClassName('header')[0].style.backgroundColor = '#238';
    }, 0);  
    
    setTimeout(function sunrise () {
	// *** final color for header animation *** //
          document.getElementsByClassName('mini-header')[0].style.backgroundColor = '#238';
          document.getElementsByClassName('mini-header')[0].style.padding = '5px 50px 5px 100px';
    }, 0);  
    
    setTimeout(function sunrise () {
	// *** final color for header animation *** //
          document.getElementsByClassName('grow-header')[0].style.backgroundColor = '#238';
          document.getElementsByClassName('grow-header')[0].style.padding = '90px';
    }, 0);  
    
    
    $('#searchResults').DataTable();


} );

