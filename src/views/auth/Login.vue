<template lang="pug">
  .auth__form
    h1.ui-title-2 Вход
    form(@submit.prevent="onSubmit")
      .form-item
        input(
          type="email"
          placeholder="Email"
          v-model.trim="email"
          :class="{error: $v.email.$error}"
          @change="$v.email.$touch()"
        )
        .error(v-if="$v.email.$dirty && !$v.email.required") Filed is required
        .error(v-else-if="$v.email.$dirty && !$v.email.email") Invalid email address
      .form-item
        input(
          type="password"
          placeholder="Password"
          v-model.trim="password"
          :class="{error: $v.password.$error}"
          @change="$v.password.$touch()"
        )
        .error(v-if="$v.password.$dirty && !$v.password.required") Password is required
        .error(v-else-if="$v.password.$dirty && !$v.password.minLength")
          | Password must have at least {{$v.password.$params.minLength.min}} letters
      .button-list
        button.button.button--plain.button-primary.w-100(
          type="submit" value="Login"
        )
          span(v-if="loading") Загрузка...
          span(v-else) Вход
      .button-list.button-list--info(v-if="submitStatus")
        p(v-if="submitStatus === 'OK'") Thanks for your submission!
        p(v-if="submitStatus === 'ERROR'") Пожалуйста, заполните форму правильно
        p(v-else) {{ submitStatus }}
      .button-list.button-list--info
        span У вас ещё нет аккаунта? 
        router-link(to="/registration") Регистрация
</template>

<script>
import { required, email, minLength } from 'vuelidate/lib/validators'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Login',
  data: () => ({
    email: '',
    password: '',
    submitStatus: null
  }),
  validations: {
    email: {required, email},
    password: {required, minLength: minLength(8)},
  },
  methods: {
    ...mapActions(['loginUser']),
    async onSubmit() {
      this.$v.$touch()

      if (this.$v.$invalid) {
        this.submitStatus = 'ERROR'
      } else {
        const user = {
          email: this.email,
          password: this.password
        }

        await this.loginUser(user)
          .then(() => {
            console.log('LOGIN!')
            this.submitStatus = 'OK'
            this.$router.push('/')
          }).catch(err => {
            this.submitStatus = err.message
          })
      }
    }
  },
  computed: mapGetters(['loading'])
}
</script>

<style lang="scss" scoped>
  .auth__form {
    min-width: 300px;
    order: -1;

    @media (min-width: 768px) {
      order: 0;
    }
  }

  .form-item {
    .error {
      margin-bottom: 8px;
      font-size: 13px;
      color: #fc5c65;
    }
  }

  input {
    &.error {
      border-color: #fc5c65;
      animation: shakeX .5s ease;
    }
  }

  .button-list {
    margin-bottom: 20px;

    &.button-list--info {
      text-align: center;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  .button {
    font-size: 16px;
    margin: 0;
  }
  .w-100 {
    width: 100%;
  }
  a {
    color: #444ce0;
  }
</style>