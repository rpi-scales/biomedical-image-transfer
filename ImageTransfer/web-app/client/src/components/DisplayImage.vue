<!-- For doctor only-->
<template>
    <div>
        <h1>Doctor Page</h1>
        <h3>Logged in as {{this.$session.get("userId")}}</h3>

        <form v-on:submit = "checkStatus">
            <input type="submit" value="Check Status">
        </form> 

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
            url:""
        };
    },
    beforeCreate: function () {
        if (!this.$session.exists()) {
        this.$router.push('/')
        }
    },
    methods: {
        async checkStatus() {
            const apiResponse = await PostsService.validateUser(this.$session.get("userId"));
            let apiData = JSON.parse(JSON.stringify(apiResponse.data));
            if(apiResponse.data.error){
                this.checkResponse = apiResponse.data.error;
            } else {
                if(apiData.imgKey === ""){
                    this.checkResponse.msg = "You don't have any message from patient. ";
                }else{
                    this.checkResponse.msg = "You have received message from patient. ";
                    this.checkResponse.data = apiData.imgKey;
                    
                }
            } 
        },

        async decrypt() {
            const apiResponse = await PostsService.queryDocRecord(this.$session.get("userId"), this.checkResponse.data);
            let apiData = JSON.parse(JSON.stringify(apiResponse.data));
            this.imgKey = apiData;
            this.url = "http://localhost:8080/ipfs/" + this.imgKey;
        },

        logout: function () {
            this.$session.destroy();
            this.$router.push('/');
        }
    }
}
</script>>