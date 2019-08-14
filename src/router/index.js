import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/MainView'
import OperatorLogin from '@/components/OperatorLogin'
import UserLogin from '@/components/UserLogin'
import Room from '@/components/Room'

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
      name: 'Room',
      path: '/room/:operatorId',
      component: Room
    },
    {
      name: 'RoomAsUser',
      path: '/room',
      component: Room,
      props: {isUser: true}
    }
  ]
})
