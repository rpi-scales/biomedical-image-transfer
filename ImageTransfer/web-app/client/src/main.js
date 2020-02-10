import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueSession from 'vue-session'

Vue.use(VueSession);

Vue.config.productionTip = false;

new Vue({
  render: function (h) { return h(App) },
  router,
}).$mount('#app')

