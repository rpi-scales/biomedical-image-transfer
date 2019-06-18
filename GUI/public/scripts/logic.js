var data = "";

$(function () {
	$.ajax({
		type: 'GET',
		contentType: 'application/json',
		url: '/yaml',						
		success: function(d) {
			data = d;
			console.log(d);
		}
	})
	
	$('.export').click(function () {
		let dataStr = JSON.stringify(data);
		let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
		
		let exportFileDefaultName = 'data.json';
		
		let linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	});
});