'use strict';

class Patient {
    constructor (userId, firstName, lastName) {
        this.userId =userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.type = "Patient";
    }
}

module.exports = Patient;