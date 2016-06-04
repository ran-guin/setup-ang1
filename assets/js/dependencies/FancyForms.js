
/* Designed to be used with loadLookup, which dynmically injects HTML for dropdown table */ 
$(document).on("click", ".dropdown-menu li a", function() {
	var label = $(this).attr('label') || $(this).text() || '';
	var id = $(this).attr('value') || '';
	var value = $(this).data('value');

	$(this).parents(".dropdown").find('.btn').html(label + 
		' <span class="caret"></span>');

	$(this).parents(".dropdown").find('.btn').val(value);


	$(this).parents(".dropdown").find('.fill-id').val(id);
	$(this).parents(".dropdown").find('.fill-label').val(label);

});
