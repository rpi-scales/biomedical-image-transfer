<template>
  <div class="posts">
    <h1>Select Doctor</h1>
    <input type="radio" id="one" value="doctor1" v-model="picked">
    <label for="one">Doctor 1</label>
    <br>
    <input type="radio" id="two" value="doctor2" v-model="picked">
    <label for="two">Doctor 2</label>
    <br>
    <br>
    <span v-if="picked">
      Picked:
      <b>{{ picked }}</b>
    </span>
    <br>
    <br>
    <!--span><b>{{ response }}</b></span><br /-->
    <form v-on:submit="selectDoctor">
      <input type="text" v-model="input.userId" placeholder="Enter userId">
      <br>
      <input type="submit" value="Select Doctor">
      <br>
    </form>
    <br>
    <a :href="publicPath + 'uploadFile.html'">Upload File</a>
    <br>
    <br>
    <span v-if="response">
      <b>{{ response }}</b>
    </span>
    <br>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "response",
  data() {
    return {
      input: {},
      picked: null,
      response: null,
      publicPath: process.env.BASE_URL
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    async selectDoctor() {
      await this.runSpinner();

      const electionRes = await PostsService.queryWithQueryString('election');

      let electionId = electionRes.data[0].Key;

      console.log("picked: ");
      console.log(this.picked);
      console.log("voterId: ");
      console.log(this.input.userId);
      this.response = null;
      //error checking for making sure to vote for a valid party
      if (this.picked === null ) {
        let response = "You have to pick a doctor!";
        this.response = response;
        await this.hideSpinner();
      } else if (this.input.userId === undefined) {
        console.log('this.userId === undefined')
        let response = "You have to enter your userId to cast a vote!";
        this.response = response;
        await this.hideSpinner();
      } else {
        const apiResponse = await PostsService.castBallot(
          electionId,
          this.input.voterId,
          this.picked
        );
        console.log('apiResponse: &&&&&&&&&&&&&&&&&&&&&&&');
        console.log(apiResponse);

        if (apiResponse.data.error) {
          this.response= apiResponse.data.error;
          await this.hideSpinner();
        } else if (apiResponse.data.message) {
          this.response= `Could not find voter with voterId ${this.input.voterId}
            in the state. Make sure you are entering a valid voterId`;
          await this.hideSpinner();
        } 
        else {
          let response = `Successfully recorded vote for ${this.picked} party 
            for voter with voterId ${apiResponse.data.voterId}. Thanks for 
            doing your part and voting!`;

          this.response = response;

          console.log("cast ballot");
          console.log(this.input);
          await this.hideSpinner();
        }
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
