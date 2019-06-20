var data;

var safe_tags = function (str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
}

$(function () {
	$.ajax({
		type: 'GET',
		contentType: 'application/json',
		url: '/yaml',
		success: function(d) {
			data = d;
			console.log(data);
			for (var i = 0; i < 10; i++) {
				$('.tbody').append(`<tr>
					<td>${data.resource.id}</td>
					<td>${data.resource.observation.subject.display} {${safe_tags(data.resource.observation.subject.reference)}}</td>
					<td>${data.resource.observation.performer.display} {${safe_tags(data.resource.observation.performer.reference)}}</td>
					<td>${data.resource.observation.issued}</td>
					<td>${data.resource.observation.value}</td>
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
});
