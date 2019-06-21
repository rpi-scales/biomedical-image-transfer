var data;

var safe_tags = function (str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
}


var action = {
	submit_record : function () {
		
	},
	
}

$(function () {
	$.ajax({
		type: 'GET',
		contentType: 'application/json',
		url: '/yaml',
		success: function(d) {
			data = d;
			console.log(data);
			for (var i = 0; i < 5; i++) {
				$('.tbody').append(`<tr>
					<td>${data.resource.id}</td>
					<td>${data.resource.observation.value.subject.display} {id : ${data.resource.observation.value.subject.id}}</td>
					<td>${data.resource.observation.value.operator.display} {id : ${data.resource.observation.value.operator.id}}</td>
					<td>${data.resource.observation.value.issued}</td>
					<td>${data.resource.observation.value.content}</td>
					</tr>`);
			}
		}
	});





	$('.export').click(function () {
		let dataStr = JSON.stringify(data);
		let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

		let exportFileDefaultName = 'data.json';

		let linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	});
	
	
	/** 
	 *	Here go the action listeners
	 **/
	
	$('.action-submit-record').click(function () {
		console.log($(this));
		
	});
	
	$('.action-request-record').click(function () {
		console.log($(this));	
	});
	
	$('.action-grant-access').click(function () {
		console.log($(this));
	});
	
	$('.action-revoke-access').click(function () {
		console.log($(this));
	});
	
});
