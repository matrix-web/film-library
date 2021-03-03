import Vue  from 'vue'
import Vuex from 'vuex'

import common from './common'
import user from './user'
import task from './task'
import tag  from './tag'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    common,
    user,
    task,
    tag
  }
})
