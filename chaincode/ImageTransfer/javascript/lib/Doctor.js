'use strict';

var User = require('./User.js');

/**
 * PatientRecords is an array of dictionaries. 
 * patientRecords = [
 *      {
 *          UserId: patient's id,
            Name: patient's name,
            ImageKeys: [],
            Notes: "",
            Role: primary or specialist     <- indicates access level
 *      },
        {
            UserId: ...,
            ...
        }
 * ]
 */

class Doctor extends User{
    constructor (userId, firstName, lastName, publicKey) {
        super(userId, firstName, lastName, publicKey);
        this.type = "Doctor";
        this.specialty = "";
        this.primaryPatientRecords = [];
        this.otherPatientRecords = [];
    }
}

module.exports = Doctor;