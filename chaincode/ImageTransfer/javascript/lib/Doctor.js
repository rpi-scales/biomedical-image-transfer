'use strict';

class Doctor {
    constructor (userId, firstName, lastName, publicKey) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.type = "Doctor";
        this.imgKey = "";
        this.publicKey = publicKey;
    }
}

module.exports = Doctor;