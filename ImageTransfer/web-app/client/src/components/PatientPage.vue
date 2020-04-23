<template>
    <div>
        <h1>Patient Page</h1>
        <span v-if="userInfo">
        <div id = "userInfo">
            <h4>User Information: </h4>
            <p>Your name: {{this.userInfo.firstName}} {{this.userInfo.lastName}}</p>
            <p>Your user id: {{this.$session.get("userId")}}</p>
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
        <br>
        <p>{{this.response.giveAccessRes}}</p>
        <br>

        <h3>2. Upload File</h3>
        <input type="file" @change="captureFile">
        
        <br>
        <button @click="submit">Submit</button>
        <span v-if="ipfsHash">
            <p>IPFS Hash is {{ipfsHash}}</p>
        </span>
        <br>    

        <h3>{{this.response.submitRes}}</h3>
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
import helper from "../util/helpers.js";

export default {
  name: "response",
  
  data() {
    return {
      input: {},
      picked: null,
      response: {},
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
        this.doctors = apiResponse.data;
        console.log("Doctor List: ");
        console.log(this.doctors);

        this.userInfo = JSON.parse(this.$session.get("userInfo"));
        console.log("User Information");
        console.log(this.userInfo);
    },

    async giveAccess () {
        const apiResponse = await PostsService.giveAccessTo(this.$session.get("userId"), this.picked);
        console.log("Give Access ApiResponse");
        console.log(apiResponse);
        this.response.giveAccessRes = apiResponse.data;
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
        console.log("Original reader result:" + reader.result);
        this.buffer = await Buffer.from(reader.result); // Output: Hello!
        console.log("File content: " + this.buffer); 
        console.log(this.buffer.toString())
        
        const apiResponse = await PostsService.encryptContent(this.$session.get("userId"), this.picked, this.buffer.toString());
        this.encryptedBuffer = JSON.stringify(apiResponse.data);
        console.log("ENCRYPTED " + this.encryptedBuffer);
    },

    async submit() {
        event.preventDefault(); 
        await ipfs.files.add(Buffer.from(this.encryptedBuffer), (err, IpfsHash) => {
            this.ipfsHash = IpfsHash[0].hash;
        }); 
        //http://localhost:8080/ipfs/<this.ipfsHash>
        console.log("Submitted");
        const apiResponse = await PostsService.updateImageKey(this.$session.get("userId"), this.picked, this.ipfsHash);
        console.log("Select doctor response");
        console.log(apiResponse);
        if (apiResponse.data.error){
            this.response.submitError = apiResponse.data.error;
        } else {
            this.encryptedHash = JSON.stringify(apiResponse.data);
            this.response.submitRes = "Succeed :)";
        }
    },

    logout: function () {
      this.$session.destroy();
      this.$router.push('/');
    }
  }
};
</script>
