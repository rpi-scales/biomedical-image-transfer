<!-- For doctor only-->
<template>
    <div>
        <h1>Doctor Page</h1>
        <h3>Logged in as {{this.$session.get("userId")}}</h3>

        <h4>You currently have following patients:</h4>
        <br>
        <label v-for="item in patients"> 
            <input type="radio" v-model="picked" :value="item"> {{ item }}
            <br>
        </label>
        <span v-if="picked">
            Picked:
            <b>{{ picked }}</b>
            <br>
            <p>Do you want to check patient {{picked}}'s records?</p>
            <button @click="checkPatientRecord"> Yes </button> 
        </span>
        <br>

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

        <span v-if="imgKey">
            <b>Decrypted Image Key is {{this.imgKey}}</b>
            <br>
            <br>
            <iframe :src=this.url></iframe>
        </span>
        <br>
        <br>

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
            input: {},
            imgKey: "",
            url:"",
            patients: null,    // Patient list
            picked: null,        // picked patient
            patientNote: null,
            patientImageHash: null
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
        async fetchData() {
            // Should do querying all patients the doctor has
            const apiResponse = await PostsService.queryPatients(this.$session.get("userId"));
            console.log(apiResponse);
            this.patients = apiResponse.data;
        },

        async checkPatientRecord() {
            const apiResponse = await PostsService.fetchRecord(this.$session.get("userId"), this.picked);
            console.log(apiResponse);
            let patientRec = apiResponse.data;
            this.patientNote = patientRec.Notes;
            this.patientImageHash = patientRec.ImageKeys;
        },

        async decrypt() {
            const BufferList = require('bl/BufferList');
            const file = await ipfs.files.get(this.patientImageHash);
            console.log(file);
            
            const content = new BufferList();
            let array = file[0].content;  
            console.log(helper.bytestoString(array));

            let decodedString = helper.bytestoString(array);
            
            // decrypt based on selected patient
            const apiResponse = await PostsService.decryptContent(this.$session.get("userId"), this.picked, decodedString);
            console.log(apiResponse);
            //this.url = "http://localhost:8080/ipfs/" + this.imgKey;
        },

        logout: function () {
            this.$session.destroy();
            this.$router.push('/');
        }
    }
}
</script>>