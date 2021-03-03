import firebase from 'firebase/app'

export default {
  state: {
    tags: []
  },
  mutations: {
    newTag(state, tag) {
      console.log(tag)
      state.tags.push(tag)
    },
    loadTags(state, tags) {
      state.tags = tags
    }
  },
  actions: {
    async newTag({commit}, tag) {
      commit('clearError')
      commit('setLoading', true)

      try {
        const savedTag = await firebase.database().ref('tags').push(tag)
        commit('newTag', {
          id: savedTag.key,
          ...tag
        })
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async loadTags({commit}) {
      commit('clearError')
      commit('setLoading', true)

      try {
        const tagsData = await firebase.database().ref('tags').once('value')
        const tags = tagsData.val()
        const tagsList = []

        if (tags) {
          Object.keys(tags).forEach(key => {
            const tag = tags[key]
            tagsList.push({
              ...tag,
              id: key
            })
          })
        }

        commit('loadTags', tagsList)
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async deleteTag({commit}, id) {
      commit('clearError')
      commit('setLoading', true)

      try {
        await firebase.database().ref('tags').child(id).remove()
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }
  },
  getters: {
    tags(state) {
      return state.tags
    }
  }
}