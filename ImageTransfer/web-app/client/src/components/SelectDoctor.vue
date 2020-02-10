<template>
  <div class="posts">
    <h1>Patient Page</h1>
    <h4>Select a doctor and upload image</h4>
    <h3>Logged in as {{this.$session.get("userId")}}</h3>

    <h3>1. Select Doctor</h3>
    <input type="radio" id="one" value="B" v-model="picked">
    <label for="one">Doctor 1</label>
    <br>
    <input type="radio" id="two" value="C" v-model="picked">
    <label for="two">Doctor 2</label>
    <br>
    <span v-if="picked">
      Picked:
      <b>{{ picked }}</b>
    </span>
    <br>

    <h3>2. Upload File</h3>
    <input type="file" @change="captureFile">
    <button @click="upload">Upload Image</button>

    <br>
    <br>
    <button @click="submit">Submit</button>
    <br>    

    <h3>{{this.ipfsHash}}</h3>
    <h3>{{this.response}}</h3>

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
      buffer: ""
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  beforeCreate: function () {
    if (!this.$session.exists()) {
      this.$router.push('/')
    }
  },
  methods: {
    async runSpinner() {
      this.$refs.Spinner.show();
    },
    async hideSpinner() {
      this.$refs.Spinner.hide();
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
      //file is converted to a buffer for upload to IPFS
      const Bufferdata = await Buffer.from(reader.result);
      //set this buffer -using es6 syntax
      this.buffer = Bufferdata;
      console.log("BUF " + this.buffer);
    },

    async upload() {
      event.preventDefault();
      await ipfs.files.add(this.buffer, (err, IpfsHash) => {
        this.ipfsHash = IpfsHash[0].hash;
        console.log(this.ipfsHash);
      }); 
      //http://localhost:8080/ipfs/<this.ipfsHash>
    },

    async submit() {
      console.log(this.ipfsHash);
      const apiResponse = await PostsService.selectDoctor(this.$session.get("userId"), this.picked, this.ipfsHash);
      if (apiResponse.data.error){
        this.response = apiResponse.data.error;
      } else {
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
