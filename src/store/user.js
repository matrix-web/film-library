import firebase from 'firebase/app'
import User from './user_help'

export default {
  state: {
    user: null
  },
  mutations: {
    setUser(state, id) {
      state.user = id
    }
  },
  actions: {
    async registerUser({commit}, {email, password}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const user = await firebase.auth().createUserWithEmailAndPassword(email, password)
        commit('setUser', new User(user.user.uid))
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async loginUser({commit}, {email, password}) {
      commit('clearError')
      commit('setError', true)
      try {
        const user = await firebase.auth().signInWithEmailAndPassword(email, password)
        commit('setUser', new User(user.user.uid))

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async logoutUser({commit}) {
      await firebase.auth().signOut()
      commit('setUser', null)
    },
    loggedUser({commit}, user) {
      commit('setUser', new User(user.uid))
    }
  },
  getters: {
    user (state) {
      return state.user
    },
    checkUser (state) {
      return state.user !== null
    }
  }
}