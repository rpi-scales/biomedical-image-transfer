# Medical Record Sharing System
## Introduction
The healthcare data is stored on a secure, permissioned chain which greatly increase the ease of access to information from different hospitals. For example, if a user is visiting the hospital for the first time, then the doctor can quickly obtain user's medical histories after a previous practitioner gives access. 

## Run application
1. Go to ImageTransfer folder, run `./startFabric.sh`. 
2. Go to javascript folder inside ImageTransfer. Run `npm install`. 
3. Run `node enrollAdmin.js`. 
4. Go to web-app folder inside ImageTransfer. 
5. Open two terminals, one goes to server folder, one goes to client folder. Run `npm install` in both folders to install necessary node_modules. Run `npm audit fix` if necessary. 
6. In server terminal, run `node start`. 
7. In client terminal, run `node run serve`. 
8. Go to localhost 8080. 

## Data Structure
### Components
1. Organization: an entity which has access to channels/ledgers and can issue identities to participants so that every transaction’s source is clear and identifiable. 
2. Channel/Ledger/Database: ways to organize and secure data. Organizations join channels and thus get access to certain ledgers
3. Participants/Peers: doctors, patients, etc. 

### Structure
- Participants/Peers
  - Doctor (Class Name)
    - User ID
    - Name (FirstName + LastName)
    - Institution ID
    - (Public Key)
  - Patient (Class Name)
    - User ID
    - Name (FirstName + LastName)
    - (Public Key)
- Transaction
  - Transaction (Class Name)
    - Doctor User ID
    - Patient User ID
    - Transaction ID
    - Timestamp
    - Medical Images


## Use Cases
**Case 1: Information transfer between providers to treat a patient**
Parties involved: A patient, Mike; his primary care physician, Dr. A, working in Practice Alpha; a pulmonologist, Dr. B, working in Practice Beta; a radiologist, Dr. C, working in Practice Zeta affiliated with Beta; and a hospital where Dr. B has a privilege.
Case: Mike is 55 years old, working in a maintenance contractor for a university. He is covered by employer-sponsored insurance. 

He has been feeling chest pain for a while. His primary care physician, Dr. A, referred him to a pulmonologist, Dr. B, for a more careful examination. After Mike visited Dr. B, he was sent to a radiologist, Dr. C, for a CT scan. After Dr. B received the results from Dr. C, he found Mike has a large pneumothorax and needs a chest tube placed into his body, to help drain the air and allow the lung to re-expand. Dr. B can perform this surgery in the hospital, where Mike has to stay for several days until it is safe to remove the tube. 

Information storage and flow: (1) Dr. A has most of the medical records related to Mike. (2) Mike is a new patient to Dr. B, so Dr. B needs to access the relevant health records for Mike and update his records since his visit. (3) Dr. C performs the CT-scan for Mike and sends the image results to Dr. B. (4) Dr. B needs to access all the information to determine the diagnosis in his office. (5) Dr. B needs to access all the information when performing the surgery in the hospital.


**Case 2: Data transfer from medical device to providers and researchers**
Parties involved: A company that sells a heart rate tracker; a payer (i.e. an insurance company) that purchases the device; physicians who distribute the device to patients; patients who use the device; research community that collects the data in the device for research

Case: A company has designed a heart rate tracker that can monitor patients’ heart rate, (store and) send the data to a central server, and alert patients/providers in case of irregular heartbeat. A payer that believes the tracker can help preventing severe adverse events and improve enrollees’ long-term health purchases the device and encourages affiliated physicians to distribute it to related patients. The company is also working with a university to improve the design of the device, so the data will be shared with the researchers for research purpose. 

Information storage and flow: (1) The firm owns and stores data on heart rates, patient behavior, and location. (2) Physicians might access those data for diagnosis when patients visit. (3) Physicians or payers also have access to patient’s complete health records. (4) Researchers access data on the device and some health outcomes for the patients. 
