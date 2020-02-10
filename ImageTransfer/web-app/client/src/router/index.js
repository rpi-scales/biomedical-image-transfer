import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import SelectDoctor from '@/components/SelectDoctor'
import QueryAll from '@/components/QueryAll'
import DisplayImage from '@/components/DisplayImage'

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
      path: '/queryAll',
      name: 'QueryAll',
      component: QueryAll
    }, 
    {
      path: '/displayImage',
      name: 'DisplayImage',
      component: DisplayImage
    }
  ]
})
