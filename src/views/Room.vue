<template>
  <div>
    <v-btn x-small color="secondary" dark>Extra small Button</v-btn>
  </div>
</template>

<script>
import io from "socket.io-client";

// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: "Home",
  data: () => ({}),
  mounted() {
    const socket = io("http://localhost:3000");
    socket.on("connect", function() {
      console.log('')
    });
    socket.on("event", function(data) {
      console.log(data)
    });
    socket.on("disconnect", function() {});
  },
  beforeRouteLeave(to, from, next) {
    console.log("i am leave chatRoom");
    next();
  },
};
</script>
