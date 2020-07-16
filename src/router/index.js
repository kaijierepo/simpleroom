import Vue from 'vue'
import VueRouter from 'vue-router'
import Room from '../views/Room.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/room',
    name: 'Room',
    component: Room
  },
  {
    path: '/',
    name: 'Login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
