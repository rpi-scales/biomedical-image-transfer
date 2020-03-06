'use strict';

// Document Record
class DocRecord {
	constructor (encrypedKey, patientId, doctorId) {
		this.encrypedKey = encrypedKey;
		this.patientId = patientId;
		this.doctorId = doctorId;
	}
}
module.exports = DocRecord;