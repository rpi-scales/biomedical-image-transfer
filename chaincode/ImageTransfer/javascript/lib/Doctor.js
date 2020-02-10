'use strict';

class Doctor {
    constructor (userId, firstName, lastName) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.type = "Doctor";
        this.imgKey = "";
    }
}

module.exports = Doctor;