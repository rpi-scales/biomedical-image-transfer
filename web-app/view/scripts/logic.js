var data;
var port = '6001';


var safe_tags = function (str) {
	return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
}


var action = {
	submit_record : function () {
		
	},
	
}

var appendModal = {
	count : 0,
	upload : function (loc, str) {
		$(loc).append(`	<div class="input-group mb-3">
					<div class="input-group-prepend">
						<span class="input-group-text" id="inputGroupFileAddon0${appendModal.count}">Upload ${str}</span>	
					</div>
					<div class="custom-file">
						<input type="file" class="custom-file-input" id="inputGroupFile0${appendModal.count}" aria-describedby="inputGroupFileAddon0${appendModal.count}">
						<label class="custom-file-label" for="inputGroupFile0${appendModal.count}">Choose file</label>
					</div>
				</div>`);
		appendModal.count += 1;
	},
	query : function (loc, str) {
		$(loc).append(`	<div class="input-group mb-3">
					<div class="input-group-prepend">
						<button class="btn btn-outline-secondary" type="button" id="button-addon${appendModal.count}">${str}</button>
					</div>
					<input type="text" class="form-control" placeholder="" aria-label="${str}" aria-describedby="button-addon${appendModal.count}">
				</div>`);
		appendModal.count += 1;
	},
	message : function (loc, str) {
		$(loc).append(`	<div class="input-group mb-3">
					<div class="input-group-prepend">
						<button class="btn btn-outline-secondary" type="button" id="button-addon${appendModal.count}">${str}</button>
					</div>
					${str}
					<input type="text" class="form-control" placeholder="${str}" aria-label="${str}" aria-describedby="button-addon${appendModal.count}">
				</div>`);
	}
}

$(function () {
	
	$('.action-Initialization').click(function () {
		$.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: '/fabric/enrollAdmin*',
			success: function() {
				console.log("Admin successfully enrolled!");
				appendModal.message('.action-modal-body', "Admin successfully enrolled!");
			}
		});
	})
	
	$.ajax({
		type: 'GET',
		contentType: 'application/json',
		url: '/api/getSupportedLanguages*',
		success: function(d) {
			
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
	
	
	$('.action').click(function () {
		$('#actionModalLabel').text($(this).text());
		$('.action-modal-body').empty();
	})
	
	/** 
	 *	Here go the action listeners
	 **/
	
	$('.action-submit-record').click(function () {
		console.log($(this));
		appendModal.upload('.action-modal-body', "Record");
		
	});
	
	$('.action-request-record').click(function () {
		console.log($(this));	
		appendModal.query('.action-modal-body', "recNumber");
		appendModal.query('.action-modal-body', "requestor");
		appendModal.query('.action-modal-body', "purpose");
	});
	
	$('.action-grant-access').click(function () {
		console.log(data);
		appendModal.query('.action-modal-body', "recNumber");
		appendModal.query('.action-modal-body', "owner");
		appendModal.query('.action-modal-body', "recip");
		$.ajax({
			type: 'GET',
			contentType: 'application/json',
			data: {
				trans_id : data.resource.id,
				owner : data.resource.meta.auditLog.agent.name,
				receptor : "Joe Smith" //TODO: Placeholder right now. This should be the part where the user enters the name
			},
			url: '/giveAccess',
			success: function(d) {
				
			}
		});
	});
	
	$('.action-revoke-access').click(function () {
		console.log($(this));
		appendModal.query('.action-modal-body', "recNumber");
		appendModal.query('.action-modal-body', "owner");
	});
	
});
