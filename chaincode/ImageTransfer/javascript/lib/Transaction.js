'use strict';

class Transaction {
	constructor (doc_userId, pat_userId, img_key, transacId) {
		this.doc_userId = doc_userId;
		this.pat_userId = pat_userId;
		this.img_key = img_key;
		this.transacId = transacId;
		// transaction id
	}
}
module.exports = Transaction;