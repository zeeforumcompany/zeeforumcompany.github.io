// Copy json text area value to clipboard
document.getElementById('copy').addEventListener('click', function() {
	// Select Textarea by ID
	var jsonTextarea = document.getElementById('json');
	jsonTextarea.select();

	// Copy textarea value to clipboard
	document.execCommand('copy');
});