<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: "App",
  data: () => ({
    //
  }),
  methods: {
    joinRoom () {
      this.$router.push({name: 'Room'})
    }
  }
};
</script>

<style lang="stylus" scoped>
.container
  display flex
  flex-direction column
  height 100vh
  justify-content center
  align-items center
.join
  text-align center
  width: 180px
</style>
