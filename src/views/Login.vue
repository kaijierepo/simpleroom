<template>
  <div class="container">
    <div class="join">
      <v-form ref="form">
        <v-text-field  v-model="roomName"   label="room name"></v-text-field>
        <v-btn @click="joinRoom">Join</v-btn>
      </v-form>
    </div>
  </div>
</template>

<script>
// import io from 'socket.io-client';

export default {
  name: "App",
  data: () => ({
    roomName: ''
  }),
  methods: {
    joinRoom() {
      this.$router.push({ name: "Room", param: this.roomName });
    },
  },
   beforeRouteLeave (to, from, next) {
     console.log('i am leave')
     next()
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
