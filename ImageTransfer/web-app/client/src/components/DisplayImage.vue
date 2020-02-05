<!-- For doctor only-->
<template>
    <div>
        <h1>Doctor Page</h1>
        <h3>Enter user id</h3>
        <form v-on:submit = "checkStatus">
            <input type="text" v-model="input.userId" placeholder="Enter userId">
            <input type="submit" value="Check Status">
        </form>

        <span v-if="checkResponse">
            <b>{{ checkResponse.data }}</b>
        </span>
        
        <br>
        <br>
        <h3>Please go to the following address:</h3>
        <h4>http://localhost:8080/ipfs/{{imgKey}}</h4>
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
                data:""
            },
            imgKey: ""
        };
    },
    methods: {
        async checkStatus() {
            if (!this.input.userId) {
                let response = 'Please enter a userid';
                this.checkResponse.data = response;
            } else {
                const apiResponse = await PostsService.validateUser(this.input.userId);
                let apiData = JSON.parse(JSON.stringify(apiResponse.data));
                if(apiResponse.data.error){
                    this.checkResponse = apiResponse.data.error;
                } else {
                    this.imgKey = apiData.imgKey;
                    this.checkResponse.data = JSON.stringify(apiData);
                } 
            }
                
        }
    }
}
</script>>