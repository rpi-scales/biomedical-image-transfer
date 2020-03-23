'use strict';

class Patient {
    constructor (userId, firstName, lastName, publicKey) {
        this.userId =userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.type = "Patient";
        this.publicKey = publicKey;

    }
}

module.exports = Patient;