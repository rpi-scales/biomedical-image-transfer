'use strict';

class User {
    constructor (userId, firstName, lastName, publicKey) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.publicKey = publicKey;
    }
}

module.exports = User;