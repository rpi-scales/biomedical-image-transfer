<template>
    <div>
        <h3>Patient Register Page</h3>
        
        <form v-on:submit="registerUser">
            <p class="h4 text-center mb-4">Sign up</p>

            <label class="grey-text">Your Name: </label>
            <input type="text" v-model="registerData.firstName" placeholder="first name">
            <input type="text" v-model="registerData.lastName" placeholder="last name">
            <br>

            <label class="grey-text">Your User Id: </label>
            <input type="text" v-model="registerData.userId">
            <br>

            <label class="grey-text">Your Age: </label>
            <input type="text" v-model="registerData.age">
            <br>

            <label class="grey-text">Your insurance (Yes/No): </label>
            <input type="text" v-model="registerData.insurance">
            <br>

            <div class="text-center mt-4">
                <input type="submit" value="Register">
            </div>
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
import { mdbInput, mdbBtn } from 'mdbvue';

export default {
    name: "Basic",
    data () {
        return {
            registerData: {
                type: "patient"
            },
            registerResponse: {
                data: ""
            }
        };
    },
    components: {
        VueInstantLoadingSpinner,
        mdbInput,
        mdbBtn
    },
    methods: {

        async registerUser() {
            await this.runSpinner();
            const apiResponse = await PostsService.registerUser (
                this.registerData.userId, 
                this.registerData.firstName,
                this.registerData.lastName,
                this.registerData.type
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