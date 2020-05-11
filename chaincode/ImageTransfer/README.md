# Biomed Image Transfer Smart Contract

## ImageTansfer.js

The smart contract extends Hypterledger Contract. Some functions:

1. ctx.stub.putState
2. ctx.stub.getState
3. ctx.stub.getQueryResult

Currently, the smart contract supports the followings:

1. createPatient, createDoctor: create users
2. shareInfowith: share information with another doctor
3. queryAll, queryWithQueryString, queryByObjectType
4. userExists: check whether a user exists
5. giveAccessTo: a patient grants access to the primary doctor he/she selected
6. updateImageKey: update the image key of a particular patient
7. readMyAsset: return an object based on userId
8. Helper functions: findPatient, getInfo