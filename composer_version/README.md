# Medical Record Sharing System
## Introduction
The healthcare data is stored on a secure, permissioned chain which greatly increase the ease of access to information from different hospitals. For example, if a user is visiting the hospital for the first time, then the doctor can quickly obtain user's medical histories after the user gives access. 
## Specifications
### transactions
authorizeAccess
Patient signs transaction
Inputs: Doctor key (email)
Outputs: Boolean success
revokeAccess
Patient signs transaction
Inputs: Doctor key (email)
Outputs: Boolean success
### models
Doctor has first name, last name and email. 
Patient has first name, last name, email and list of doctors. 
If we were implementing the actual medical records, the patient will have a hash pointer to their medical record.
## How to run
1. Drag the bna file to http://composer-playground.mybluemix.net/
2. Deploy it.
3. Create patient and doctors through the test tab.
4. For patients to grant their medical records to their doctor, go to ID registry and use the patient's key (email) to create a new ID. Log in and submit an authorizaAccess transaction and put the doctor's key (email) that you want to grant access to. 
5. To revoke access to a doctor, follow the same procedures in 4, but do a revokeAccess transaction instead of authorizeAccess transaction. 
6. For doctors to read/write patient's medical records, go to ID registry and use the doctor's key (email) to create a new ID. Log in and access by going to the patient tab under test tab. Doctor can only see the patients who grant access to them.
## Exceptions
If the user is traveling and has an emergency situation that he/she cannot grant access to the hospital, how can the doctor check the medical histories?
