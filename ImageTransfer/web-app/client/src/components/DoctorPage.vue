<!-- For doctor only-->
<template>
    <div>
        <h1>Doctor Page</h1>
        <span v-if="userInfo">
            <div id = "userInfo">
                <h4>User Information: </h4>
                <p>Your name: {{this.userInfo.firstName}} {{this.userInfo.lastName}}</p>
                <p>You user id: {{this.$session.get("userId")}}</p>
                <p>Primary patient records:</p>
                <div id="PatientRec"></div>
                <p>Other patient records:</p>
                <div id="OtherPatientRec"></div>
            </div>
        </span>

        <div id="register">  
            <h4>Do you want to share your patient information with other doctors?</h4>
            <label v-for="item in doctors"> 
                <input type="radio" v-model="pickedDoctor" :value="item.Key"> {{ item.Key }}
                <br>
            </label>
            <span v-if="pickedDoctor">
                Picked:
                <b>{{ pickedDoctor }}</b>
            
                <h4>Whose information do you want to share?</h4>
                <label v-for="item in userInfo.primaryPatientRecords"> 
                    <input type="radio" v-model="picked" :value="item.UserId"> {{ item.UserId }}
                    <br>
                </label>
                <span v-if="picked">
                    Picked:
                    <b>{{ picked }}</b>
                    <br>
                    <h4>Upload File</h4>
                    <input type="file" @change="captureFile">
                    <br><br>
                    <button @click="submit">Submit</button>
                    <br> 
                    <button @click="shareInfowith"> Share </button> 
                    <span v-if="shareInfoRes">
                        <p>{{shareInfoRes}}</p>
                    </span>
                </span>
            </span>
            
            <br>
            <span v-if="picked">
                <p>Do you want to check patient {{picked}}'s records?</p>
                <button @click="checkPatientRecord"> Yes </button> 
            </span>

            <span v-if = "patientImageHash">
                Patient Note: <b>{{patientNote}}</b>
                <br>
                Patient Image Hash: <b>{{patientImageHash}}</b>
            </span>

            <br>
            <br>

            <form v-on:submit = "decrypt">
                <input type="submit" value="Decrypt Image Hash">
            </form> 

            <br>
            <span v-if="decryptedContent">
                <p>Decrypted Content is {{this.decryptedContent}}</p>
            </span>

            <span v-if="imgKey">
                <b>Decrypted Image Key is {{this.imgKey}}</b>
                <br>
                <br>
                <iframe :src=this.url></iframe>
            </span>
            <br>
            <br>
        </div>

        <button @click="logout">Log Out</button>
        <br>
    </div>
</template>

<script>
import PostsService from "@/services/apiService";
import ipfs from "../util/ipfs.js";
import helper from "../util/helpers.js";



export default {
    name: "response",
    data() {
        return {
            imgKey: "",
            url:"",
            patients: null,    // Patient list
            picked: null,        // picked patient
            patientNote: null,
            patientImageHash: null,
            userInfo: null,
            doctors: null,
            pickedDoctor: null,
            shareInfoRes: null,
            ipfsHash: null,
            decryptedContent: null
        };
    },

    mounted: function() {
        this.fetchData() // Calls the method before page loads
    },

    beforeCreate: function () {
        if (!this.$session.exists()) {
        this.$router.push('/')
        }
    },
    
    methods: {
        captureFile(event) {
            event.stopPropagation();
            event.preventDefault();
            const file = event.target.files[0];
            let reader = new window.FileReader();
            reader.readAsArrayBuffer(file);
            reader.onloadend = () => this.convertToBuffer(reader);
        },

        async convertToBuffer(reader) {
            console.log("Original reader result:" + reader.result);
            this.buffer = await Buffer.from(reader.result); // Output: Hello!
            console.log("File content: " + this.buffer); 
            
            const apiResponse = await PostsService.encryptContent(this.$session.get("userId"), this.pickedDoctor, this.buffer);
            this.encryptedBuffer = JSON.stringify(apiResponse.data);
            console.log("ENCRYPTED " + this.encryptedBuffer);
        },

        async submit() {
            event.preventDefault(); 
            await ipfs.files.add(Buffer.from(this.encryptedBuffer), (err, IpfsHash) => {
                this.ipfsHash = IpfsHash[0].hash;
            }); 
            //http://localhost:8080/ipfs/<this.ipfsHash>
            console.log("Submitted");
        },

        // Fetch all data before the page loads
        async fetchData() {
            // Display current user's information
            this.userInfo = JSON.parse(this.$session.get("userInfo"));
            console.log("Current User Information: "); console.log(this.userInfo);

            // Display all doctors in the system
            let apiResponse = await PostsService.queryByDoctor();
            this.doctors = apiResponse.data;
            
            // Display all patients the doctor has
            console.log("Doctor's primary patients:")
            console.log(this.userInfo.primaryPatientRecords);
            this.getPatientRecord(this.userInfo.primaryPatientRecords, "PatientRec", "You don't have any primary patients yet.");

            console.log("Doctor's other patients:");
            console.log(this.userInfo.otherPatientRecords);
            this.getPatientRecord(this.userInfo.otherPatientRecords, "OtherPatientRec", "You don't have any other patients yet.");
        },

        async checkPatientRecord() {
            const apiResponse = await PostsService.fetchRecord(this.$session.get("userId"), this.picked);
            console.log("Fetch patient record response: "); console.log(apiResponse);
            const patientRec = apiResponse.data;
            this.patientNote = patientRec.Notes;
            this.patientImageHash = patientRec.ImageKeys;
        },

        async decrypt() {
            const BufferList = require('bl/BufferList');
            const file = await ipfs.files.get(this.patientImageHash);
            console.log("IPFS File Content: "); console.log(file); 
            
            const content = new BufferList();
            let array = file[0].content;  
            console.log("IPFS File Content bytestoString: " );console.log(helper.bytestoString(array));

            let decodedString = helper.bytestoString(array);
            ipfs.files.get(this.patientImageHash, function (err, files) {
                files.forEach((file) => {
                    console.log(file.path)
                    console.log("File content >> ",file.content.toString('utf8'))
                })
            });
            
            // decrypt based on selected patient
            const apiResponse = await PostsService.decryptContent(this.$session.get("userId"), this.picked, helper.bytestoString(array));
            
            console.log("Decrypted Content Response: ");console.log(apiResponse);
            console.log(apiResponse.data);
            this.decryptedContent = apiResponse.data;

            console.log("Base 64 Image: " + this.decryptedContent);

            var img = new Image();
            img.src = this.decryptedContent;
            document.body.appendChild(img);

            //this.url = "http://localhost:8080/ipfs/" + this.imgKey;
        },

        async shareInfowith() {
            if(this.$session.get("userId") == this.pickedDoctor) {
                console.log("ERROR: Share information not sucess: sharing info with yourself");
                this.shareInfoRes = 'Error: You cannot share information with yourself';
                return;
            }
            const apiResponse = await PostsService.shareInfowith(this.$session.get("userId"), this.pickedDoctor, this.picked, this.ipfsHash);
            this.shareInfoRes = 'You shared '+ this.picked + ' information with '+this.pickedDoctor;
            console.log("Share information response: "); console.log(apiResponse);
        },

        logout: function () {
            this.$session.destroy();
            this.$router.push('/');
        },

        getPatientRecord(patientList, elementId, response) {
            if (patientList.length != 0) {
                let str = '';
                patientList.forEach(function(patient) {
                    str += `Patient UserId: ${patient.UserId} <br> Patient Name: ${patient.Name} 
                            <br> Notes: ${patient.Notes} <br> Image Keys: ${patient.ImageKeys} <br>`;
                }); 
                document.getElementById(elementId).innerHTML = str;
            } else {
                document.getElementById(elementId).innerHTML = response;
            }
        }
    }
}
</script>>