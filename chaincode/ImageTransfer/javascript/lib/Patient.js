'use strict';

var User = require('./User.js');

class Patient extends User{
    constructor (userId, firstName, lastName, publicKey) {
        super(userId, firstName, lastName, publicKey);
        this.age = "";
        this.insurance = "";
        this.type = "Patient";
        this.primaryDoctor = "";
        this.specialist = [];
    }
}

module.exports = Patient;