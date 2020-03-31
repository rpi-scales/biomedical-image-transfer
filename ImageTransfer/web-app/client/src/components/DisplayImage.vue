<!-- For doctor only-->
<template>
    <div>
        <h1>Doctor Page</h1>
        <h3>Logged in as {{this.$session.get("userId")}}</h3>

        <form v-on:submit = "checkStatus">
            <input type="submit" value="Check your patients">
        </form> 

        <label v-for="item in patients"> 
            <input type="radio" v-model="picked" :value="item"> {{ item }}
            <br>
        </label>
        <span v-if="picked">
            Picked:
        <b>{{ picked }}</b>
        </span>
        <br>

        <br>
        <br>

        <span v-if="this.checkResponse.msg">
            <b>{{this.checkResponse.msg}} </b>
            <br>
        </span>

        <span v-if="this.checkResponse.data">
            <b> Encrypted image key: {{this.checkResponse.data}}</b>
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

export default {
    name: "response",
    data() {
        return {
            input: {},
            checkResponse: {
                data:"",
                msg:""
            },
            imgKey: "",
            url:"",
            patients: null,
            picked: null
        };
    },
    beforeCreate: function () {
        if (!this.$session.exists()) {
        this.$router.push('/')
        }
    },
    methods: {
        async checkStatus() {
            // Should do querying all patients the doctor has
            const apiResponse = await PostsService.queryPatients(this.$session.get("userId"));
            console.log(apiResponse);
            this.patients = apiResponse.data;
        },

        async decrypt() {
            // decrypt based on selected patient
            
            //this.url = "http://localhost:8080/ipfs/" + this.imgKey;
        },

        logout: function () {
            this.$session.destroy();
            this.$router.push('/');
        }
    }
}
</script>>