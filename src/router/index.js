import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/MainView'
import OperatorLogin from '@/components/OperatorLogin'
import UserLogin from '@/components/UserLogin'
import UserRoom from '@/components/ClientRoom'
import OperatorRoom from '@/components/OperatorRoom'

Vue.use(Router)

export default new Router({
  routes: [
    {
      name: 'CreateItem',
      path: '/',
      component: HelloWorld
    },
    {
      name: 'OperatorLogin',
      path: '/login/operator',
      component: OperatorLogin
    },
    {
      name: 'UserLogin',
      path: '/login/user',
      component: UserLogin
    },
    {
      name: 'OperatorRoom',
      path: '/room/:roomId',
      component: OperatorRoom,
      props: true
    },
    {
      name: 'UserRoom',
      path: '/room',
      component: UserRoom
    }
  ]
})
