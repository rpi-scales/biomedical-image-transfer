<template>
  <div id="app">      
        <p><router-link to="/">Home</router-link>&nbsp;</p>
        <h1>BioMed Image Transfer System</h1>
      <router-view></router-view>
    </div>
</template>

<script>

export default {
  name: 'app'  
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.chart-wrapper {
  width: 100%;
  height: 700px;
}
.echarts {
  width: 100%;
  height: 100%;
}

#loader {
  position:fixed;
  padding-top: 250px;
}

.chart-wrapper {
  position:fixed;
  padding-left:32%;
}

#register {
    text-align: left;
    margin-left: 37%;
}

#userInfo {
  text-align: left;
  margin-left: 10%;
}

</style>
