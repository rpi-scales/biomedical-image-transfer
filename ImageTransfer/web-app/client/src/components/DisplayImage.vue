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

        <span v-if="imgKey">
            <h3>Please go to the following address:</h3>
            <b>http://localhost:8080/ipfs/{{imgKey}}</b>
        </span>

        <span v-if="this.checkResponse.msg">
            <b>{{this.checkResponse.msg}}</b>
        </span>

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
            imgKey: ""
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
                    this.imgKey = apiData.imgKey;
                    this.checkResponse.data = JSON.stringify(apiData);
                }
            } 
        },

        logout: function () {
            this.$session.destroy();
            this.$router.push('/');
        }
    }
}
</script>>