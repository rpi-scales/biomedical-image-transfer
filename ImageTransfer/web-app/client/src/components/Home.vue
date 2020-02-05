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
      <input type="radio" id="one" value="Patient" v-model="registerData.type">
      <label for="one">Patient</label>
      <br>
      <input type="radio" id="two" value="Doctor" v-model="registerData.type">
      <label for="two">Doctor</label>
      <br>
      <input type="submit" value="Register">
    </form>
    <br>
    <span v-if="registerData.type">
      Picked:
      <b>{{ registerData.type }}</b>
    </span>
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
      this.registerResponse = apiResponse;
      await this.hideSpinner();
    },

    async validateUser() {
      await this.runSpinner();

      if (!this.loginData.userId) {
        let response = 'Please enter a userId';
        this.loginResponse.data = response;
        await this.hideSpinner();
      } else {
        const apiResponse = await PostsService.validateUser(
          this.loginData.userId
        );
        let apiData = JSON.parse(JSON.stringify(apiResponse.data));

        if (apiResponse.data.error) {
          // console.log(apiResponse);
          this.loginResponse = apiResponse.data.error;
        } else {
          if(apiData.type === "Patient"){
            this.$router.push("SelectDoctor");
          } else {
            this.$router.push("DisplayImage");
          }
        }
        this.loginResponse = apiResponse;
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
