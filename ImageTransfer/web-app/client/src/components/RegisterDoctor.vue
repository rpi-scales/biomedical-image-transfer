<template>
    <div>
        <h3>Doctor Register Page</h3>
        <form v-on:submit="registerUser">
            <input type="text" v-model="registerData.userId" placeholder="Enter User ID">
            <br>
            <input type="text" v-model="registerData.firstName" placeholder="Enter first name">
            <br>
            <input type="text" v-model="registerData.lastName" placeholder="Enter last name">
            <br>
            <input type="text" v-model="registerData.specialty" placeholder="Enter your specialty">
            <br>
            
            <input type="submit" value="Register">
        </form>

        
        <br>
        <span v-if="registerResponse">
            <b>{{ registerResponse.data }}</b>
        </span>
        <br>

        <vue-instant-loading-spinner id='loader' ref="Spinner"></vue-instant-loading-spinner>
        
    </div>
</template>

<script>

import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
    name: "response",
    data () {
        return {
            registerData: {
                type: "doctor"
            },
            registerResponse: {
                data: ""
            }
        };
    },
    components: {
        VueInstantLoadingSpinner
    },
    methods: {
        async registerUser() {
            await this.runSpinner();
            const apiResponse = await PostsService.registerUser (
                this.registerData.userId, 
                this.registerData.firstName,
                this.registerData.lastName,
                this.registerData.specialty
            );
            this.registerResponse = apiResponse;
            await this.hideSpinner();
        },
        async runSpinner() {
            this.$refs.Spinner.show();
        },
        async hideSpinner() {
            this.$refs.Spinner.hide();
        }
    }
};

</script>