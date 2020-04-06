<template>
  <div>
    <h1>Patient Page</h1>
    <span v-if="userInfo">
      <div id = "userInfo">
        <h4>User Information: </h4>
        <p>Your name: {{this.userInfo.firstName}} {{this.userInfo.lastName}}</p>
        <p>You user id: {{this.$session.get("userId")}}</p>
        <p>Your primary doctor: {{this.userInfo.primaryDoctor}}</p>
        <p>Your specialist: {{this.userInfo.specialist}}</p>
      </div>
    </span>

    <br>
    <div id = "register">
      <h4>Select a doctor and upload image: </h4>
      <h3>1. Select Your Primary Doctor</h3>

      <label v-for="item in doctors"> 
          <input type="radio" v-model="picked" :value="item.Key"> {{ item.Key }}
          <br>
      </label>

      <span v-if="picked">
        Picked:
        <b>{{ picked }}</b>
      </span>
      <br>

      <button @click="giveAccess">Submit</button>

      <h3>2. Upload File</h3>
      <input type="file" @change="captureFile">
      <button @click="upload">Upload Image</button>

      <br>
      <br>
      <button @click="submit">Submit</button>
      <br>    

      <h3>{{this.response}}</h3>
      <h3>The encrypted hash is: {{this.encryptedHash}}</h3>

    </div>
    <br>
    <button @click="logout">Log Out</button>
    <br>

    <br>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>


<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";
import ipfs from "../util/ipfs.js";

export default {
  name: "response",
  
  data() {
    return {
      input: {},
      picked: null,
      response: null,
      ipfsHash: "",
      buffer: "",
      doctors: null,
      encryptedHash: "",
      encryptedBuffer: "",
      userInfo: null
    };
  },
  
  mounted: function() {
    this.fetchData() // Calls the method before page loads
  },
  
  components: {
    VueInstantLoadingSpinner
  },

  beforeCreate: function () {
    if (!this.$session.exists()) {
      this.$router.push('/');
    } 
  },

  methods: {
    async runSpinner() {
      this.$refs.Spinner.show();
    },
    async hideSpinner() {
      this.$refs.Spinner.hide();
    },

    async fetchData () {
      let apiResponse = await PostsService.queryByDoctor();
      this.doctors = JSON.parse(JSON.stringify(apiResponse.data));
      console.log(this.doctors);

      this.userInfo = JSON.parse(this.$session.get("userInfo"));
      console.log(this.userInfo);
    },

    async giveAccess () {
      const apiResponse = await PostsService.giveAccessTo(this.$session.get("userId"), this.picked);
      console.log(apiResponse);
    },
    
    captureFile(event) {
      event.stopPropagation();
      event.preventDefault();
      const file = event.target.files[0];
      let reader = new window.FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = () => this.convertToBuffer(reader);
    },

    async convertToBuffer(reader) {
      const Bufferdata = await Buffer.from(reader.result);
      this.buffer = Bufferdata;
      console.log("BUF " + this.buffer);
      const apiResponse = await PostsService.encryptContent(this.$session.get("userId"), this.picked, this.buffer);
      this.encryptedBuffer = JSON.stringify(apiResponse.data);
      console.log("ENCRYPTED " + this.encryptedBuffer);
    },

    async upload() {
      event.preventDefault(); 
      await ipfs.files.add(Buffer.from(this.encryptedBuffer), (err, IpfsHash) => {
        this.ipfsHash = IpfsHash[0].hash;
      }); 
      //http://localhost:8080/ipfs/<this.ipfsHash>
    },

    async submit() {
      console.log("Submitted");
      const apiResponse = await PostsService.selectDoctor(this.$session.get("userId"), this.picked, this.ipfsHash);
      console.log("Select doctor response");
      console.log(apiResponse);
      if (apiResponse.data.error){
        this.response = apiResponse.data.error;
      } else {
        this.encryptedHash = JSON.stringify(apiResponse.data);
        this.response = "Succeed :)";
      }
    },

    logout: function () {
      this.$session.destroy();
      this.$router.push('/');
    }
  }
};
</script>
