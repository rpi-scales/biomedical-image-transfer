import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import PatientPage from '@/components/PatientPage'
import DoctorPage from '@/components/DoctorPage'
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
      path: '/patientPage',
      name: 'PatientPage',
      component: PatientPage
    },
    {
      path: '/doctorPage',
      name: 'DoctorPage',
      component: DoctorPage
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
