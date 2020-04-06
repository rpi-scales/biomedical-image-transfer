# Medical Record Sharing System
## Introduction
The healthcare data is stored on a secure, permissioned chain which greatly increase the ease of access to information from different hospitals. For example, if a user is visiting the hospital for the first time, then the doctor can quickly obtain user's medical histories after a previous practitioner gives access. 

## Run application
*Make sure you've installed `ipfs` and `docker`*
1. Run docker. 
2. Go to ImageTransfer folder, run `./startFabric.sh`. <br/>
   1. Creates a channel called ‘myChannel’, two organizations ‘org0.example.com’ and ‘org1.example.com’. Each organization has two peers, for example, ‘peer0.org0.example.com’. 
3. Go to javascript folder inside ImageTransfer. Run `npm install`. 
4. Run `node enrollAdmin.js`. 
   1. This step enrolls an admin (in ImageTransfer/web-app/server/wallet); otherwise you won’t be able to register user without an admin. 
5. Go to web-app folder inside ImageTransfer. 
6. Open two terminals, one goes to server folder, one goes to client folder. Run `npm install` in both folders to install necessary node_modules. Run `npm audit fix` if necessary. 
7. In server terminal, run `node start`. 
8. In client terminal, run `node run serve`. 
9. Go to localhost 8080. 
10. Run `ipfs daemon` if you want to test upload image feature. 

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
    - Public Key
    - Specialty
    - PatientRecords
      - UserId: Patient's Id
      - Name: Patient's Name
      - ImageKeys: []
      - Notes: ""
      - Role: primary or specialist (Indicate access level)
    - (Institution)
  - Patient (Class Name)
    - User ID
    - Name (FirstName + LastName)
    - Public Key
    - Age
    - Insurance
    - Primary Doctor
    - Specialists (Who has access to the patient's records)

## Use Cases
**Case 1: Information transfer between providers to treat a patient**

Parties involved: A patient, Mike; his primary care physician, Dr. A, working in Practice Alpha; a pulmonologist, Dr. B, working in Practice Beta; a radiologist, Dr. C, working in Practice Zeta affiliated with Beta; and a hospital where Dr. B has a privilege.

Case: Mike is 55 years old, working in a maintenance contractor for a university. He is covered by employer-sponsored insurance.

Over the past month, he has noticed a tightness in his chest when he walks quickly, or climbs more than one flight of stairs. This tightness lasts about 10 minutes, if he rests. His primary care physician, Dr. A, referred him to a cardiologist Dr. B, for evaluation. Dr. B was concerned that Mike had coronary artery disease, and scheduled a stress echocardiogram. The results of that test were strongly suggestive of coronary artery disease, so Mike was referred to a radiologist, Dr. C, for a cardiac CT scan, which confirmed the diagnosis. After Dr. B received the results from Dr. C, he referred Mike to Dr. D, an interventional cardiologist, for cardiac stent placement. Dr. D can perform this procedure in the hospital as an outpatient, and Mike will be able to leave the hospital on the day of the procedure in the absence of any complications.

Information storage and flow: (1) Dr. A has most of the medical records related to Mike. (2) Mike is a new patient to Dr. B, so Dr. B needs to access the relevant health records for Mike and update his records since his visit. (3) Dr. C performs the CT-scan for Mike and sends the image results to Dr. B. (4) Dr. B needs to transfer all of the information to Dr. D, who will perform the stent placement (5) Dr. D needs to access all the information before conducting the stent placement in the hospital.


**Case 2: Data transfer from medical device to providers and researchers**

Parties involved: A company that sells a device that measures heart rate and can record an electrocardiogram (ECG); a payer (i.e. an insurance company) that purchases the device; physicians who distribute the device to patients; patients who use the device; research community that collects the data in the device for research

Case: A company has designed a device that can monitor patients’ heart rate, (store and), and record an electrocardiogram, and send the data to a central server, and alert patients/providers in case of irregular heartbeat or abnormal ECG. A payer that believes the device can help to rapidly identify serious cardiac events in patients at risk purchases the device and encourages affiliated physicians to distribute it to appropriate patients. The company is also working with a university to improve the design of the device, so the data will be shared with the researchers for research purpose. 

Information storage and flow: (1) The firm owns and stores data on heart rates, patient behavior, and location. (2) Physicians might access those data for diagnosis when patients visit. (3) Physicians or payers also have access to patient’s complete health records. (4) Researchers access data on the device and some health outcomes for the patients. 

## Notes
1. Useful links (ipfs)
   1. https://www.youtube.com/watch?v=jONZtXMu03w
   2. https://medium.com/@angellopozo/uploading-an-image-to-ipfs-e1f65f039da4
