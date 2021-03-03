<template lang="pug">
  .content-wrapper
    section
      .container
        .auth
          .auth__banner
            img(src="../assets/img/banner.jpg" alt="banner")
          router-view
</template>

<style lang="scss" scoped>
  .auth {
    display: flex;
    flex-direction: column;
    align-items: center;

    @media(min-width: 768px) {
      flex-direction: row;
    }
  }
</style>
