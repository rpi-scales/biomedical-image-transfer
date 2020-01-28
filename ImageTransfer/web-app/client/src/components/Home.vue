<template>
  <div class="posts">
    <h1>BioMed Image Transfer System</h1>
    <h3>If you are a registered user, enter your User ID below</h3>
    <form v-on:submit="validateUser">
      <input type="text" v-model="loginData.userId" placeholder="Enter User ID">
      <br>

      <input type="submit" value="Login">
      <br>
      <br>
      <span v-if="loginResponse">
        <b>{{ loginResponse.data }}</b>
      </span>
      <br>
    </form>

    <br>
    <h3>Otherwise, fill out the form below to register!</h3>
    <form v-on:submit="registerUser">
      <input type="text" v-model="registerData.userId" placeholder="Enter User ID/Drivers License">
      <br>
      <input type="text" v-model="registerData.firstName" placeholder="Enter first name">
      <br>
      <input type="text" v-model="registerData.lastName" placeholder="Enter last name">
      <br>
      <input type="text" v-model="registerData.type" placeholder="Enter Patient/Doctor">
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
  data() {
    return {
      loginData: {},
      registerData: {},
      registerResponse: {
        data: ""
      },
      loginResponse: {
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
      const apiResponse = await PostsService.registerUser(
        this.registerData.userId,
        this.registerData.firstName,
        this.registerData.lastName,
        this.registerData.type
      );
      console.log(apiResponse);
      this.registerResponse = apiResponse;
      await this.hideSpinner();
    },

    async validateUser() {
      await this.runSpinner();

      if (!this.loginData.userId) {
        console.log("!thislogin");
        let response = 'Please enter a userId';
        this.loginResponse.data = response;
        await this.hideSpinner();
      } else {
        const apiResponse = await PostsService.validateUser(
          this.loginData.userId
        );
        console.log("apiResponse");
        console.log(apiResponse.data);

        if (apiResponse.data.error) {
          // console.log(apiResponse);
          console.log(apiResponse.data.error);
          this.loginResponse = apiResponse.data.error;
        } else {
          this.$router.push("SelectDoctor");
        }

        console.log(apiResponse);
        this.loginResponse = apiResponse;
        // this.$router.push('castBallot')
        await this.hideSpinner();
      }
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
