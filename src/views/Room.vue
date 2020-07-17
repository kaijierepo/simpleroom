<template>
  <div>
    <video ref="vid" width="400px" height="300px"></video>
  </div>
</template>

<script>
import io from 'socket.io-client'

// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  data: () => ({
    socket: null,
    pc: null,
    priority: 0
  }),
  mounted() {
    const room = this.$route.params.roomName
    const socket = io(`http://localhost:3000?room=${room}`)
    this.socket = socket

    const pc = new RTCPeerConnection()
    
    pc.onadddstream = (obj) => {
      const vid = this.$refs.vid
      vid.srcObject = obj.steam
    }
    this.pc = pc

    navigator.getUserMedia({ video: true, audio: true }, function(stream) {
      pc.onaddstream({ stream: stream })
      // Adding a local stream won't trigger the onaddstream callback
      pc.addStream(stream)

      pc.createOffer(function(offer) {
        pc.setLocalDescription(
          new RTCSessionDescription(offer),
          function() {
            // send the offer to a server to be forwarded to the friend you're calling.
          },
          this.error
        )
      }, this.error)
    })

    socket.on('priority', (data) => {
      this.priority = data
    })

    socket.on('broadcast', function(data) {
      console.log(data)
      // const { count } = data
      // if(count === 2) {

      // }
    })
    socket.on('disconnect', function() {})
  },
  methods: {
    error: function() {
      var videos = document.getElementsByTagName('video')
      for (var i = 0; i < videos.length; i++) {
        videos[i].pause()
      }

      this.pc.close()
    },
  },
  beforeRouteLeave(to, from, next) {
    console.log('i am leave chatRoom')
    this.socket.close()
    next()
  },
}
</script>
