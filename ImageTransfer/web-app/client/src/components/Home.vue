<template>
  <div class="Home Page">
    <h3>Sign In</h3>
    <form v-on:submit="validateUser">
      <label class="grey-text">Enter Your User Id: </label><br>
      <input type="text" v-model="loginData.userId">
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
    <h3>Sign Up</h3>
    
    <router-link to="/registerDoctor">Register as Doctor</router-link>&nbsp;
    <br>
    <router-link to="/registerPatient">Register as Patient</router-link>&nbsp;
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
      loginResponse: {
        data: ""
      }
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {

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
          this.loginResponse = apiResponse.data.error;
        } else {
          this.$session.start();
          this.$session.set('userId', this.loginData.userId);
          this.$session.set('userInfo', JSON.stringify(apiData));
          if(apiData.type == "Patient"){
            this.$router.push("PatientPage");
          } else {
            this.$router.push("DoctorPage");
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
