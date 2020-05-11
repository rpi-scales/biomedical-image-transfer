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
                <div id="PatientRec" v-for="patient in userInfo.primaryPatientRecords">
                    <input type="radio" v-model="checkPatientPicked" name="profileImg" :value="patient.UserId"> 
                        Paitient UserId: {{patient.UserId}} <br>
                        Patient Name: {{patient.Name}} <br>
                        Notes: {{patient.Notes}} <br>
                        Image Keys: {{patient.ImageKeys}} <br>
                </div>
                <br>
                <span v-if="checkPatientPicked">
                    <p>Do you want to check patient {{checkPatientPicked}}'s records?</p>
                    <button @click="checkPatientRecord"> Check Record </button> 
                </span>
                <br>
                <span v-if = "patientImageHash"> 
                    Patient Note: <b>{{patientNote}}</b>
                    <br>
                    Patient Image Hash: <b>{{patientImageHash}}</b>
                    <form v-on:submit = "decrypt">
                        <input type="submit" value="Decrypt Image Hash">
                    </form> 
                    <br>
                    <span v-if="decryptedContent">
                        <p>Decrypted Content is {{this.decryptedContent}}</p>
                    </span>
                    <br>
                    <img id="DecryptedImage">
                </span>

                <br>
                <br>

                
                <p>Other patient records:</p>
                <div id="OtherPatientRec"></div>
                <div id="OtherPatientRec" v-for="patient in userInfo.otherPatientRecords">
                    <input type="radio" v-model="checkOtherPatientPicked" name="profileImg" :value="patient.UserId"> 
                        Paitient UserId: {{patient.UserId}} <br>
                        Patient Name: {{patient.Name}} <br>
                        Notes: {{patient.Notes}} <br>
                        Image Keys: {{patient.ImageKeys}} <br>
                </div>
                <br>
                <span v-if="checkOtherPatientPicked">
                    <p>Do you want to check patient {{checkOtherPatientPicked}}'s records?</p>
                    <button @click="checkPatientRecord"> Check Record </button> 
                    <span v-if = "patientImageHash"> 
                        Patient Note: <b>{{patientNote}}</b>
                        <br>
                        Patient Image Hash: <b>{{patientImageHash}}</b>
                        <form v-on:submit = "decrypt">
                            <input type="submit" value="Decrypt Image Hash">
                        </form> 
                        <br>
                        <span v-if="decryptedContent">
                            <p>Decrypted Content is {{this.decryptedContent}}</p>
                        </span>
                        <br>
                        <img id="DecryptedImage">
                    </span>
                </span>
                <br>
                

                <br>
                <br>
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
                    <button @click="shareInfowith"> Share </button> 
                    <span v-if="shareInfoRes">
                        <p>{{shareInfoRes}}</p>
                    </span>
                </span>
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
            decryptedContent: null,
            checkPatientPicked: null,
            checkOtherPatientPicked: null
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

        // Fetch all data before the page loads
        async fetchData() {
            // Display current user's information
            this.userInfo = JSON.parse(this.$session.get("userInfo"));
            console.log("Current User Information: "); console.log(this.userInfo);

            // Display all doctors in the system
            let apiResponse = await PostsService.queryByDoctor(this.$session.get("userId"));
            this.doctors = apiResponse.data;
            
            // Display all patients the doctor has
            console.log("Doctor's primary patients:"); console.log(this.userInfo.primaryPatientRecords);

            console.log("Doctor's other patients:"); console.log(this.userInfo.otherPatientRecords);
        },

        async checkPatientRecord() {
            let apiResponse;
            if (this.checkPatientPicked) {
                apiResponse = await PostsService.fetchRecord(this.$session.get("userId"), this.checkPatientPicked, "primary");
            } else {
                if (this.checkOtherPatientPicked) {
                    apiResponse = await PostsService.fetchRecord(this.$session.get("userId"), this.checkOtherPatientPicked, "other");
                }
            }
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
            
            // decrypt based on selected patient
            const apiResponse = await PostsService.decryptContent(this.$session.get("userId"), this.checkPatientPicked, helper.bytestoString(array));
            
            console.log("Decrypted Content Response: ");console.log(apiResponse);
            console.log(apiResponse.data);
            this.decryptedContent = apiResponse.data;

            console.log("Base 64 Image: " + this.decryptedContent);

            let img = new Image();
            img.src = this.decryptedContent;
            document.getElementById("DecryptedImage").src = this.decryptedContent;

            //this.url = "http://localhost:8080/ipfs/" + this.imgKey;
        },

        // Get pickedPatient's image, encrypt, upload to ipfs, return hash
        // this.picked is patient; this.pickedDoctor is the doctor
        async shareInfowith() {
            if(this.$session.get("userId") == this.pickedDoctor) {
                console.log("ERROR: Share information not sucess: sharing info with yourself");
                this.shareInfoRes = 'Error: You cannot share information with yourself';
                return;
            }
            // fetch the picked patient's imageKey
            let apiResponse = await PostsService.fetchRecord(this.$session.get("userId"), this.picked, "primary");
            let imagekey = apiResponse.data.ImageKeys;
            console.log(imagekey);

            // decrypt the content 
            const BufferList = require('bl/BufferList');
            const file = await ipfs.files.get(imagekey);
            const content = new BufferList();
            apiResponse = await PostsService.decryptContent(this.$session.get("userId"), this.picked, helper.bytestoString(file[0].content));
            
            let imgsrc = apiResponse.data;
            apiResponse = await PostsService.encryptContent(this.$session.get("userId"), this.pickedDoctor, imgsrc);
            await ipfs.files.add(Buffer.from(JSON.stringify(apiResponse.data)), (err, IpfsHash) => {
                this.ipfsHash = IpfsHash[0].hash;
            });
            console.log(this.ipfsHash); // need to press submit twice
            if (this.ipfsHash != null) {
                apiResponse = await PostsService.shareInfowith(this.$session.get("userId"), this.pickedDoctor, this.picked, this.ipfsHash);
                this.shareInfoRes = 'You shared '+ this.picked + ' information with '+this.pickedDoctor;
                console.log("Share information response: "); console.log(apiResponse);
            }
        },

        logout: function () {
            this.$session.destroy();
            this.$router.push('/');
        }
    }
}
</script>>