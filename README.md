# Film-library
Учебный проект библиотека фильмов на Vue.js.

## :hammer_and_wrench: Установка
* Скачайте проект себе на локальный компьютер командой ```git clone https://github.com/matrix-web/film-library.git```
* После скачивания перейдите в папку с проектом и в консоли выполните установку зависимостей командой ```npm install```
* После установки зависимостей запустите сборку одной из команд:
  * ```npm run serve``` - режим разработки
  * ```npm run build``` - режим сборки

Если вы всё сделали правильно, у вас должен открыться браузер с локальным сервером. Режим сборки предполагает оптимизацию проекта: сжатие изображений, минифицирование CSS и JS-файлов для загрузки на сервер.

## :open_file_folder: Файловая структура

```
film-library
├── public
├── src
│   ├── assets
│   ├── components
│   ├── layouts
│   ├── mixins
│   ├── router
│   ├── store
│   └── views
│ 
├── App.vue
├── main.js
├── registerServiceWorker.js
├── package.json
├── .browserlistrc
├── .babel.config.js
└── .gitignore
```

* Корень папки:
    * ```.babel.config.js``` — настройки Babel
    * ```.gitignore``` – запрет на отслеживание файлов Git'ом
    * ```App.vue``` — Главный компонент приложения
    * ```package.json``` — список зависимостей
