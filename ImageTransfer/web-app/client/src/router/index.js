import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import SelectDoctor from '@/components/SelectDoctor'
import DisplayImage from '@/components/DisplayImage'
import RegisterPatient from '@/components/RegisterPatient'
import RegisterDoctor from '@/components/RegisterDoctor'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/selectDoctor',
      name: 'SelectDoctor',
      component: SelectDoctor
    },
    {
      path: '/displayImage',
      name: 'DisplayImage',
      component: DisplayImage
    }, 
    {
      path: '/registerPatient',
      name: 'RegisterPatient',
      component: RegisterPatient
    },
    {
      path: '/registerDoctor',
      name: 'RegisterDoctor',
      component: RegisterDoctor
    }
  ]
})
