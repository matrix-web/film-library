<template>
  <div class="upload">
    <input class="upload__file" type="file" ref="file" @change="handleFileUpload">
    <button class="upload__button button button--round button-primary" @click.prevent="triggerInput">Открыть</button>
    <div class="preview">
      <div class="preview__image" ref="preview-img" v-for="file in files" :key="file.size">
        <Loader v-if="loading"/>
        <div class="preview__image-content" v-else>
          <button class="preview__remove" :data-name="file.name" @click.prevent="removePreview">&times;</button>
          <img :src="src" :alt="file.name">
          <div class="preview__info" :style="[fileUploading ? {transform: 'translateY(0)'} : '']">
            <div class="preview__info-progress" v-if="fileUploading" :style="{ width: loadPreview + '%'}">{{ loadPreview }}%</div>
            <template v-else>
              <span>{{ file.name }}</span>
              <span>{{ file.size | bytesToSize }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loader from '@/components/Loader'

export default {
  data: () => ({
    files: [],
    previewFiles: [],
    src: null,
    loading: false,
    loaded: false
  }),
  props: ['loadPreview', 'fileUploading'],
  components: {
    Loader
  },
  watch: {
    loadPreview(value) {
      if (+value === 100) {
        this.$refs['preview-img'].forEach(preview => preview.remove())
        this.files = []
      }
    }
  },
  filters: {
    bytesToSize(bytes) {
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

      if (!bytes) {
        return '0 Byte'
      }

      const i = +Math.floor(Math.log(bytes) / Math.log(k))

      return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i]
    }
  },
  methods: {
    handleFileUpload(event) {
      const target = event.target

      if (!target.files.length) {
        return
      }

      this.files = Array.from(event.target.files)
      
      this.files.forEach(file => {
        if (!file.type.match('image')) {
          return
        }

        const reader = new FileReader()
        reader.onloadstart = () => this.loading = true
        reader.onloadend = () => this.loading = false
        reader.onload = event => {
          this.src = event.target.result
          this.loaded = true
          this.$emit('load-files', this.files)
        }
        
        reader.readAsDataURL(file)
      })
    },
    removePreview(event) {
      const fileName = event.target.dataset.name
      const fileIdx = this.files.findIndex(file => file.name == fileName)
      const block = event.target.closest('.preview__image')
      block.classList.add('removing')

      new Promise(resolve => {
        setTimeout(() => {
          block.remove()
          resolve()
        }, 500)
      }).then(() => {
        this.files.splice(fileIdx, 1)
        this.$emit('remove-preview', this.files)
      })
    },
    triggerInput() {
      this.$refs.file.click()
    }
  }
}
</script>

<style lang="scss" scoped>
  .upload {

    &__file {
      position: absolute;
      width: .1px;
      height: .1px;
      z-index: -1;
      opacity: 0;
    }

    &__button:not(:last-child) {
      margin-right: .5rem;
    }
  }

  .preview {
    display: flex;
    flex-wrap: wrap;
    padding: .5rem 0 0;

    &__image {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 230px;
      height: 170px;
      margin: 0 .5rem .5rem 0;
      overflow: hidden;
      background-color: rgba(68, 76, 224, .4);

      &-content {
        width: 100%;
        height: 100%;
      }

      img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }

      &.removing {
        transform: scale(0);
        transition: transform .3s ease-in;
      }

      &:hover .preview__remove {
        opacity: 1;
      }

      &:hover .preview__info {
        transform: translateY(0);
      }
    }

    &__remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 25px;
      height: 25px;
      padding: 0;
      position: absolute;
      right: 0;
      top: 0;
      font-weight: bold;
      background-color: rgba(255, 255, 255, .5);
      cursor: pointer;
      opacity: 0;
      transition: opacity .22s ease-in;
    }

    &__info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      height: 25px;
      font-size: .8rem;
      background-color: rgba(255, 255, 255, .5);
      transform: translateY(100%);
      transition: transform .22s ease-in;
      padding: 0 5px;

      span:first-child {
        max-width: 70%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      &-progress {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        background-color: #42b983;
        transition: width .22s linear;
      }
    }
  }
</style>