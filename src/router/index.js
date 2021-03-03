import Vue from 'vue'
import VueRouter from 'vue-router'
import firebase  from 'firebase/app'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    meta: {layout: 'main', auth: true},
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/task',
    name: 'task',
    meta: {layout: 'main', auth: true},
    component: () => import('../views/Task.vue'),
  },
  {
    path: '/login',
    name: 'login',
    meta: {layout: 'auth'},
    component: () => import('../views/auth/Login.vue')
  }, 
  {
    path: '/registration',
    name: 'registration',
    meta: {layout: 'auth'},
    component: () => import('../views/auth/Registration.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const currentUser = firebase.auth().currentUser
  const requireAuth = to.matched.some(record => record.meta.auth)
  
  if (requireAuth && !currentUser) {
    next('/login')
  } else {
    next()
  }
})

export default router
