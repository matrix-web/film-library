import Vue from 'vue'
import Vuelidate from 'vuelidate'
import App from './App.vue'
import Paginate from 'vuejs-paginate'
import router from './router'
import store from './store'
import animate from 'animate.css'
import './registerServiceWorker'

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/messaging'
import 'firebase/storage'

Vue.config.productionTip = false

Vue.use(Vuelidate, animate)
Vue.component('paginate', Paginate)

const firebaseConfig = {
  apiKey: "AIzaSyC42Q8CQF_ZvCd85a_SwdO4arFREHUfc9I",
  authDomain: "time-library-2d785.firebaseapp.com",
  databaseURL: "https://time-library-2d785-default-rtdb.firebaseio.com",
  projectId: "time-library-2d785",
  storageBucket: "time-library-2d785.appspot.com",
  messagingSenderId: "232289155577",
  appId: "1:232289155577:web:7620bd63a946d11a47e528"
}

firebase.initializeApp(firebaseConfig)

let app = null

firebase.auth().onAuthStateChanged(user => {
  if (!app) {
    app = new Vue({
      router,
      store,
      render: h => h(App),
      created() {
        user && this.$store.dispatch('loggedUser', user)
      }
    }).$mount('#app')
  }
})
