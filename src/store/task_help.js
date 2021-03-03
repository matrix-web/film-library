export default class Task {
  constructor(
    title,
    description,
    whatWatch,
    time,
    tags,
    preview,
    imgPath = null,
    previewName = null,
    completed,
    editing,
    user = null,
    id = null
  ) {
    this.title = title
    this.description = description
    this.whatWatch = whatWatch
    this.time = time
    this.tags = tags
    this.preview = preview
    this.imgPath = imgPath,
    this.previewName = previewName
    this.completed = completed
    this.editing = editing
    this.user = user
    this.id = id
  }
}