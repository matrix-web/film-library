import firebase from 'firebase/app'
import Task from './task_help' 

export default {
  state: {
    tasks: [],
    loadPercentage: 0
  },
  mutations: {
    newTask(state, task) {
      state.tasks.push(task)
    },
    loadPreview(state, value) {
      state.loadPercentage = value
    },
    loadTasks(state, tasks) {
      state.tasks = tasks
    },
    editTask(state, {id, title, description, imgPath, previewName}) {
      const task = state.tasks.find(task => task.id === id)
      task.title = title
      task.description = description
      task.imgPath = imgPath
      task.previewName = previewName 
    },
    completedTask(state, {id, completed}) {
      const task = state.tasks.find(t => t.id === id)
      task.completed = completed
    }
  },
  actions: {
    async loadTasks({commit}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const taskData = await firebase.database().ref('tasks').once('value')
        const tasks = await taskData.val()
        const tasksArr = []
        Object.keys(tasks).forEach(key => {
          const t = tasks[key]
          tasksArr.push(
            new Task(
              t.title,
              t.description,
              t.whatWatch,
              t.time,
              t.tags,
              null,
              t.imgPath,
              t.previewName,
              t.completed,
              t.editing,
              t.user,
              key
            )
          )
        })
        commit('loadTasks', tasksArr)
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async newTask({commit, getters}, task) {
      
      commit('clearError')
      commit('setLoading', true)
      try {
        let newTask = null
        
        if (task.preview) {
          newTask = new Task(
            task.title,
            task.description,
            task.whatWatch,
            task.time,
            task.tags,
            task.preview,
            null,
            task.preview.name,
            task.completed,
            task.editing,
            getters.user.id
          )

          const ref = firebase.storage().ref(`images/${newTask.preview.name}`)
          const fileUpload = ref.put(newTask.preview)

          fileUpload.on('state_changed', snapshot => {
            const percentage = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0)
            commit('loadPreview', percentage)
          }, error => {}, () => {
            fileUpload.snapshot.ref.getDownloadURL().then(async url => {
              newTask.imgPath = url
              const savedTask = await firebase.database().ref('tasks').push(newTask)
              commit('newTask', {
                ...newTask,
                id: savedTask.key
              })
            })
          })
        } else {
          newTask = new Task(
            task.title,
            task.description,
            task.whatWatch,
            task.time,
            task.tags,
            null,
            null,
            null,
            task.completed,
            task.editing,
            getters.user.id
          )
          const savedTask = await firebase.database().ref('tasks').push(newTask)

          commit('newTask', {
            ...newTask,
            id: savedTask.key
          })
        }
        
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async editTask({commit}, {id, title, description, preview}) {
      commit('clearError')
      commit('setLoading', true)
      
      try {
        let editTask = null

        if (preview.file) {
          editTask = {
            id,
            title,
            description,
            previewName: preview.file.name
          }

          if (preview.name) {
            const storageImgRef = firebase.storage().ref(`images/${preview.name}`)

            if (storageImgRef.name) {
              storageImgRef.delete().then(() => {
                console.log('The file was successfully deleted!')
              }).catch(err => {
                console.log(err.message)
              }) 
            }
          }

          const ref = firebase.storage().ref(`images/${preview.file.name}`)
          const fileUpload = ref.put(preview.file)
          
          fileUpload.on('state_changed', snapshot => {
            const percentage = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0)
            commit('loadPreview', percentage)
          }, error => {}, () => {
            fileUpload.snapshot.ref.getDownloadURL().then(async url => {
              editTask.imgPath = url
              await firebase.database().ref('tasks').child(id).update(editTask)
              commit('editTask', editTask)
            })
          })
        } else {
          editTask = {
            id,
            title,
            description,
            previewName: preview.name,
            imgPath: preview.imgPath
          }
          await firebase.database().ref('tasks').child(id).update(editTask)
          commit('editTask', editTask)
        }

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async completedTask({commit}, {id, completed}) {
      commit('clearError')
      commit('setLoading', true)

      try {
        await firebase.database().ref('tasks').child(id).update({completed})

        commit('completedTask', {id, completed})
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async deleteTask({commit}, id) {
      commit('clearError')
      commit('setLoading', true)
      
      try {
        const taskdata = await firebase.database().ref('tasks').child(id).once('value')
        const task = await taskdata.val()

        if (task.previewName) {
          const storageImgRef = firebase.storage().ref(`images/${task.previewName}`)
          storageImgRef.delete().then(() => {
            console.log('The file was successfully deleted!')
          }).catch(err => {
            console.log(err.message)
          }) 
        }
        await firebase.database().ref('tasks').child(id).remove()
        
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }
  },
  getters: {
    tasks(state, getters) {
      return state.tasks.filter(task => task.user === getters.user.id)
    },
    taskCompleted(state, getters) {
      return getters.tasks.filter(task => task.completed)
    },
    taskNotCompleted(state, getters) {
      return getters.tasks.filter(task => !task.completed)
    },
    loadPreview(state) {
      return state.loadPercentage
    }
  }
}