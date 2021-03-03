<template lang="pug">
  .wrapper
    header
      div.navbar
        div.container
          div.navbar-content
            router-link.header-logo(to="/") Film Library
            div.button-burger(
              @click="menuShow = !menuShow"
              :class="{active: menuShow}"
            ) 
              span.line.line-1
              span.line.line-2 
              span.line.line-3
            div.navbar-list__wrapper(:class="{active: menuShow}")
              ul.navbar-list
                li.navbar-item(
                  v-for="link in linkMenu" 
                  :key="link.url" 
                  custom
                  @click="menuShow = false"
                )
                  router-link.navbar-link(:to="link.url") {{ link.title }}
                li.navbar-item(
                  v-if="checkUser"
                  @click="logout"
                )
                  span.navbar-link Выход
    component(:is="layout")
      router-view
</template>

<script>
import AuthLayout from '@/layouts/AuthLayout'
import MainLayout from '@/layouts/MainLayout'

export default {
  name: 'app',
  data: () => ({
    menuShow: false,
  }),
  methods: {
    logout() {
      this.$store.dispatch('logoutUser')
      this.$router.push('/login')
    }
  },
  components: {
    AuthLayout,
    MainLayout
  },
  computed: {
    layout() {
      return (this.$route.meta.layout || 'auth') + '-layout'
    },
    checkUser() {
      return this.$store.getters.checkUser
    },
    linkMenu() {
      if (this.checkUser) {
        return [
          {title: 'Главная', url: '/'},
          {title: 'Фильмы', url: '/task'}
        ]
      }

      return [
        {title: 'Вход', url: '/login'},
        {title: 'Регистрация', url: '/registration'}
      ]
    }
  }
}
</script>

<style lang="scss">
@import './assets/css/style.min.css';

@media (min-width: 768px) {
  .auth__banner,
  .auth__form {
    flex-basis: 50%;
  }
}

// Animation for tasks
// Active
.taskList-enter-active, .taskList-leave-active {
  transition: all .6s
}
// Enter
.taskList-enter, .taskList-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

// Animation for Tags menu
// Active
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
// Enter
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.pagination {
  display: flex;
}
.pagination__link {
  display: inline-block;
  padding: 5px 15px;
  // background-color: #444ce0;
  color: #fff;
  outline: none;
}
.pagination__item {
  margin-right: 5px;
  background-color: #444ce0;
  transition: background-color .3s ease-in;
  border-radius: 6px;

  &--active {
    background-color: rgba(68, 76, 224, .8);
  }

  &--disabled {
    background-color: rgba(68, 76, 224, .5);
  }

  &:focus {
    outline: none;
  }

  &:hover {
    background-color: rgba(68, 76, 224, .8);
  }

  &:active {
    background-color: rgb(37, 46, 224);
  }

  &:last-child {
    margin-right: 0;
  }
}

</style>
