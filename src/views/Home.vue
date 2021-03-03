<template lang="pug">
  div
    h1.ui-title-1 Главная
    form(@submit.prevent="onSubmit")
      .form-item
        input(
          type="text"
          placeholder="Что мы будем смотреть?"
          v-model.trim="taskTitle"
          @change="$v.taskTitle.$touch()"
          :class="{ error: $v.taskTitle.$error }"
        )
        .error(v-if="$v.taskTitle.$dirty && !$v.taskTitle.required") Title is required
      .form-item
        textarea(
          type="text"
          v-model.trim="taskDescription"
          placeholder="Добавьте краткое описание..."
        )
      .form-item
        UploadFile(
          @load-files="getFiles"
          @remove-preview="getFiles"
          :loadPreview="loadPreview"
          :fileUploading="fileUploading"
        )
      .option-list
        input.what-watch--radio(
          type="radio"
          id="radioFilm"
          value="Film"
          v-model="whatWatch"
        )
        label(for="radioFilm") Фильм
        input.what-watch--radio(
          type="radio"
          id="radioSerial"
          value="Serial"
          v-model="whatWatch"
        )
        label(for="radioSerial") Сериал
      .total-time
        .total-time__film(
          v-if="whatWatch === 'Film'"
        )
          span.time-title Часы
          input.time-input(
            type="number"
            v-model.number="filmHours"
          )
          span.time-title Минуты
          input.time-input(
            type="number"
            v-model.number="filmMinutes"
          )
          p {{ filmTime }}

        .total-time__serial(
          v-if="whatWatch === 'Serial'"
        )
          span.time-title Сколько сезонов?
          input.time-input(
            type="number"
            v-model.number="serialSeason"
          )
          span.time-title Сколько серий?
          input.time-input(
            type="number"
            v-model.number="serialSeries"
          )
          span.time-title Как долго длится одна серия? (minutes)
          input.time-input(
            type="number"
            v-model.number="serialSeriesMinutes"
          )
          p {{ serialTime }}
      .tag-list.tag-list--add
        .ui-tag__wrapper(@click="tagMenuShow = !tagMenuShow")
          .ui-tag
            span.tag-title Добавить новый
            span.button-close(
              :class="{active: !tagMenuShow}"
            )
      transition(name="fade")
        .tag-list.tag-list--menu(
          v-if="tagMenuShow"
        )
          input.tag-add--input(
            type="text"
            placeholder="New tag"
            v-model.trim="tagTitle"
            @keyup.enter="newTag"
          )
          button.button.button-default(
            @click.prevent="newTag"
          ) Отправить
      .tag-list
        transition-group(
          enter-active-class="animate__animated animate__fadeInRight"
          leave-active-class="animate__animated animate__fadeOutDown"
        )
          .ui-tag__wrapper(
            v-if="tags.length"
            v-for="tag in tags"
            :key="tag.title"
          )
            .ui-tag(
              @click="addTagUsed(tag)"
              :class="{used: tag.use}"
            )
              span.tag-title {{ tag.title }}
              span.button-close(
                @click="deleteTag(tag.id)"
              )
      .button-wrapper
        input.button.button--plain.button-primary(
          type="submit"
          value="Create"
          :disabled="submitStatus === 'PENDING'"
        )
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import UploadFile from '@/components/UploadFile'

export default {
  name: 'Home',
  data: () => ({
    submitStatus: null,
    taskTitle: '',
    taskDescription: '',
    whatWatch: 'Film',
    // Film
    filmHours: 1,
    filmMinutes: 30,
    // Serial
    serialSeason: 1,
    serialSeries: 11,
    serialSeriesMinutes: 40,
    // Tags
    tagsUsed: [],
    tagMenuShow: false,
    tagTitle: '',
    // Previews
    files: [],
    fileUploading: false
  }),
  validations: {
    taskTitle: {required}
  },
  components: {
    UploadFile
  },
  methods: {
    ...mapActions(['newTag', 'deleteTag', 'loadTags', 'newTask']),
    async newTag() {
      if (this.tagTitle === '') {
        return
      }

      const tag = {
        title: this.tagTitle,
        use: false
      }
      await this.newTag(tag)

      this.tagTitle = ''
      this.tagMenuShow = false
    },
    async deleteTag(id) {
      await this.deleteTag(id).then(() => {
        console.log('tag deleted')
        this.$store.dispatch('loadTags')
      })
    },
    getFiles(files) {
      setTimeout(() => this.files = files)
    },
    async onSubmit() {
      this.$v.$touch()

      if (this.$v.$invalid) {
        this.submitStatus = 'ERROR'
      } else {
        const time = (this.whatWatch === 'Film') ? this.filmTime : this.serialTime
        
        const task = {
          title: this.taskTitle,
          description: this.taskDescription,
          whatWatch: this.whatWatch,
          time,
          tags: this.tagsUsed,
          preview: this.files[0] || null,
          completed: false,
          editing: false
        }

        await this.newTask(task).then(() => {
          this.submitStatus = 'OK'
        }).catch(err => {
          this.submitStatus = err.message
        })

        if (task.preview) {
          this.fileUploading = true
          const clearTimer = setInterval(() => {
            if (+this.loadPreview === 100) {
              this.fileUploading = false
              this.files = []
              this.$router.push('/task')
              clearInterval(clearTimer)
            }
          })
        }

        // Reset
        this.taskTitle = ''
        this.taskDescription = ''
        // Reset $v (vuelidate)
        this.$v.$reset()

        // Reset for tags
        this.tagMenuShow = false
        this.tagsUsed = []
        this.tagTitle = ''

        // Reset tags.use + class 'used'
        for (let i = 0, length = this.tags.length; i < length; i++) {
          this.tags[i].use = false
        }
      }
    },
    addTagUsed(tag) {
      tag.use = !tag.use

      if (tag.use) {
        this.tagsUsed.push({
          title: tag.title
        })
      } else {
        this.tagsUsed.splice(tag.title, 1)
      }
    },
    getHoursAndMinutes(minutes) {
      const hours = Math.trunc(minutes / 60)
      const min = minutes % 60
      return `${hours} Hours ${min} Minutes`
    }
  },
  async mounted() {
    await this.loadTags()
  },
  computed: {
    ...mapGetters(['tags', 'loadPreview', 'user']),
    filmTime() {
      const min = (+this.filmHours * 60) + (+this.filmMinutes)
      return this.getHoursAndMinutes(min)
    },
    serialTime() {
      const min = this.serialSeason * this.serialSeries * this.serialSeriesMinutes
      return this.getHoursAndMinutes(min)
    },
  }
}
</script>

<style lang="scss" scoped>
  input {
    &.error {
      border-color: #fc5c65;
      animation: shakeX .5s ease;
    }
  }
  .form-item {
    margin-bottom: 15px;

    .error {
      margin-bottom: 8px;
      font-size: 13px;
      color: #fc5c65;
    }
  }
  .option-list {
    display: flex;
    margin-bottom: 15px;
    
    .what-watch--radio {
      margin-right: 12px;
    }

    label:not(:last-child) {
      margin-right: 20px;
    }
  }
  .tag-list {
    margin-bottom: 20px;

    span {
      display: flex;
      flex-wrap: wrap;
    }
  }
  .ui-tag__wrapper {
    margin-right: 18px;
    margin-bottom: 10px;
    &:last-child {
      margin-right: 0;
    }
  }
  .ui-tag {
    cursor: pointer;
    .button-close {
      &.active {
        transform: rotate(45deg);
      }
    }
    &.used {
      background-color: #444ce0;
      color: #fff;
      .button-close {
        &::before,
        &::after {
          background-color: #fff;
        }
      }
    }
  }
  .tag-list--menu {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tag-add--input {
    margin-bottom: 0;
    margin-right: 10px;
    height: 37px;
  }
  .total-time {
    margin-bottom: 20px;
  }
  .time-title {
    display: block;
    margin-bottom: 6px;
  }
  .time-input {
    max-width: 80px;
    margin-right: 10px;
  }
  .button-wrapper {
    display: flex;
    justify-content: flex-end;
  }
</style>
