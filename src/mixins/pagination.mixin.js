export default {
  data: () => ({
    page: 1,
    limit: 5,
    totalPages: 0,
    totalTasks: 0,
    allItems: [],
    items: [],
    hidden: false
  }),
  methods: {
    setupPagination(allItems) {
      this.totalTasks = allItems.length
      this.totalPages = Math.ceil(this.totalTasks / this.limit)
      this.page = +this.$route.query.page 
      this.allItems = []

      for (let i = 0; i < this.totalPages; i++) {
        const start = this.limit * i
        const end = start + this.limit
        this.allItems.push(allItems.slice(start, end))
      }
      this.items = this.allItems[this.page - 1] || this.allItems[0]
    },
    pageChangeHandler(page) {
      this.$router.push(`${this.$route.path}?page=${page}`)
      this.items = this.allItems[page - 1] || this.allItems[0]
    }
  }
}