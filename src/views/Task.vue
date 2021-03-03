<template lang="pug">
  div
    .task-list__header
      h1.ui-title-1 Фильмы
      .buttons-list
        button.button.button--plain.button-default(
          @click="filter = 'active'"
          :class="{'filter-active': isActive}"
        ) Активные
        button.button.button--plain.button-default(
          @click="filter = 'completed'"
          :class="{'filter-active': isCompleted}"
        ) Завершенные
        button.button.button--plain.button-default(
          @click="filter = 'all'"
          :class="{'filter-active': isAll}"
        ) Все
    .loader-center(v-if="loading")
      Loader
    template(v-else)
      .task-list(v-if="tasksFilter.length")
        transition-group(name="taskList")
          .task-item(
            v-for="task in tasksFilter"
            :key="task.id"
            :class="{completed: task.completed}"
          )
            .ui-card.ui-card--shadow
              .task-item__info
                .task-item__main-info
                  span.ui-label(
                    :class="[{'ui-label--primary': !task.completed}, {'ui-label--light': task.completed}]"
                  ) {{ task.whatWatch }}
                  span Total Time: {{ task.time }}
                span.button-close(
                  @click="deleteTask(task.id)"
                )
              .task-item__content
                .task-item__header
                  .ui-checkbox-wrapper
                    input.ui-checkbox(
                      type="checkbox"
                      v-model="task.completed"
                      @click="taskComplete(task.id, task.completed)"
                    )
                  span.ui-title-3 {{ task.title }}
                .task-item__body
                  .task-item__body-preview(v-if="task.imgPath")
                    img(:src="task.imgPath")
                  .task-item__body-content
                    p.ui-text-regular {{ task.description }}
                .task-item__footer
                  .tag-list
                    .ui-tag__wrapper(
                      v-for="tag in task.tags"
                      :key="tag.title"
                    )
                      .ui-tag
                        span.tag-title {{ tag.title }}
                    .buttons-list
                      .button.button--round.button-default(
                        @click="taskEdit(task.id, task.title, task.description, task.imgPath, task.previewName)"
                      ) Редактировать
                      .button.button--round(
                        @click="taskComplete(task.id, task.completed)"
                        :class="[{'button-primary': !task.completed}, {'button-light': task.completed}]"
                      )
                        span(v-if="task.completed") Вернуть
                        span(v-else) Завершить
      p(v-else) Текущий список фильмов пуст
      paginate(
        v-model="page"
        v-if="totalPages > 1"
        :page-count="totalPages"
        :click-handler="pageChangeHandler"
        :prev-text="'Previous'"
        :next-text="'Next'"
        :container-class="'pagination'"
        :page-link-class="'pagination__link'"
        :prev-link-class="'pagination__link'"
        :next-link-class="'pagination__link'"
        :prev-class="'pagination__item'"
        :next-class="'pagination__item'"
        :page-class="'pagination__item'"
        :active-class="'pagination__item--active'"
        :disabled-class="'pagination__item--disabled'"
      )
    .ui-messageBox__wrapper(
      v-if="editingPopup"
      @click="cancelTaskEdit"
      :class="{active: editingPopup}"
    )
      .ui-messageBox.animate__animated.animate__fadeInDown(@click.stop="")
        .ui-messageBox__header
          span.messageBox-title {{ titleEditing }}
          span.button-close(@click="cancelTaskEdit")
        .ui-messageBox__content
          .form-item
            p Title
            input(
              type="text"
              v-model="titleEditing"
              @keyup.esc="cancelTaskEdit"
            )
          .form-item
            p Description
            textarea(
              v-model="descrEditing"
              @keyup.esc="cancelTaskEdit"
            )
          .form-item
            UploadFile(
              @load-files="getFiles"
              @remove-preview="getFiles"
              :loadPreview="loadPreview"
              :fileUploading="fileUploading"
            )
        .ui-messageBox__footer
          .button.button-light(@click="cancelTaskEdit") Отмена
          .button.button-primary(@click="finishTaskEdit") Ok
</template>

<script>
import { mapGetters } from 'vuex'
import paginationMixin from '@/mixins/pagination.mixin.js'
import Loader from '@/components/Loader'
import UploadFile from '@/components/UploadFile'

export default {
  name: 'Task',
  data: () => ({
    filter: 'active',
    isActive: true,
    isCompleted: false,
    isAll: false,
    editingPopup: false,
    fileUploading: false,
    files: [],
    titleEditing: '',
    descrEditing: '',
    taskId: null,
    previewEdit: {
      path: null,
      name: null
    }
  }),
  mixins: [paginationMixin],
  methods: {
    getFiles(files) {
      setTimeout(() => this.files = files)
    },
    async taskComplete(id, completed) {
      completed ? completed = false : completed = true
      await this.$store.dispatch('completedTask', {
        id,
        completed
      }).then(() => {
        console.log(completed)
      })
    },
    taskEdit(id, title, description, imgPath, previewName) {
      this.editingPopup = !this.editingPopup
      this.taskId = id
      this.titleEditing = title
      this.descrEditing = description
      this.imgPath = imgPath
      this.previewName = previewName
    },
    cancelTaskEdit() {
      this.editingPopup = !this.editingPopup

      this.taskId = null
      this.titleEditing = ''
      this.descrEditing = ''
    },
    async finishTaskEdit() {
      await this.$store.dispatch('editTask', {
        id: this.taskId,
        title: this.titleEditing,
        description: this.descrEditing,
        preview: {
          file: this.files[0],
          name: this.previewName,
          imgPath: this.imgPath
        }
      })

      this.fileUploading = true
      const clearTimer = setInterval(() => {
        if (+this.loadPreview === 100) {
          this.fileUploading = false
          this.files = []
          this.editingPopup = !this.editingPopup
          clearInterval(clearTimer)
        }
      })
    },
    async deleteTask(id) {
      await this.$store.dispatch('deleteTask', id).then(() => {
        console.log('task deleted')
        this.$store.dispatch('loadTasks')
      })
    }
  }, 
  async mounted() {
    await this.$store.dispatch('loadTasks')
    this.setupPagination(this.tasksFilter)
  },
  components: {
    Loader,
    UploadFile
  },
  computed: {
    ...mapGetters(['tasks', 'taskCompleted', 'taskNotCompleted', 'user', 'loading', 'loadPreview']),
    tasksFilter() {
      if (this.filter === 'active') {
        this.isActive = true
        this.isCompleted = false
        this.isAll = false

        this.setupPagination(this.taskNotCompleted)
        if (this.items) {
          return this.items.filter(task => !task.completed)
        }
      } else if (this.filter === 'completed') {
        this.isCompleted = true
        this.isActive = false
        this.isAll = false

        this.setupPagination(this.taskCompleted)
        if (this.items) {
          return this.items.filter(task => task.completed)
        }
      } else if (this.filter === 'all') {
        this.isAll = true
        this.isActive = false
        this.isCompleted = false
        this.setupPagination(this.tasks)
        if (this.items) {
          return this.items.filter(task => task.user === this.user.id)
        }
      }

      return this.filter === 'active'
    }
  }
}
</script>

<style lang="scss" scoped>
  .loader-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .task-list__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 30px;
    .button {
      margin-right: 8px;
    }
    .ui-title-1 {
      @media (min-width: 490px) {
        margin-bottom: 0;
      }
    }
  }

  .task-list {
    margin-bottom: 30px;
  }

  .task-item {
    margin-bottom: 20px;

    &__main-info {
      display: flex;
      align-items: flex-start;
      flex-direction: column;

      @media (min-width: 490px) {
        flex-direction: row;
        align-items: center;
      }
    }

    .ui-checkbox:checked::before {
      border-color: #909399;
    }
    &.completed {
      .ui-title-3,
      .ui-text--regular,
      .ui-tag {
        text-decoration: line-through;
        color: #909399;
      }
    }
    &:last-child {
      margin-bottom: 0;
    }
  }

  .task-item__body {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;

    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: space-between;
    }

    &-preview {
      max-width: 300px;
      height: 330px;

      @media(min-width: 768px) {
        height: 400px;
        flex-shrink: 0;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
    }

    &-content {
      flex-grow: 1;
    }
  }

  .ui-label {
    margin-bottom: 8px;
    @media (min-width: 490px) {
      margin-right: 8px;
      margin-bottom: 0;
    }
  }

  .ui-tag__wrapper {
    margin-right: 10px;
    margin-bottom: 10px;

    @media(min-width: 768px) {
      margin-right: 15px;
    }

    &:last-child {
      margin-right: 0;
    }
  }

  .task-item__info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .button-close {
      width: 20px;
      height: 20px;
    }
  }

  .task-item__header {
    display: flex;
    align-items: center;
    margin-bottom: 18px;

    .ui-checkbox-wrapper {
      margin-right: 8px;
    }

    .ui-title-3 {
      margin-bottom: 0;
    }
  }

  .tag-list {
    margin-bottom: 8px;
  }

  .task-item__footer {
    .buttons-list {
      text-align: right;
    }
  }

  .buttons-list {
    .button {
      margin-right: 12px;
      &:last-child {
        margin-right: 0;
      }
    }
  }

  .ui-messageBox__wrapper {
    &.active {
      display: flex;
    }
    .button-light {
      margin-right: 8px;
    }
  }

  .filter-active {
    background-color: rgba(51, 51, 51, .8);
    color: #fff;
  }
</style>