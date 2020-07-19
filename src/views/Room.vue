<template>
  <div ref="videoList">
    <video autoplay ref="localVideo"></video>
    <video
      controls
      style="width: 400px; height: 300px"
      autoplay
      ref="remoteVideo"
    ></video>
  </div>
</template>

<script>
import io from "socket.io-client";

export default {
  name: "Home",
  data: () => ({
    socket: null,
    pc1: null,
    pc2: null,
    localStream: null,
    initiator: false,
    initiatorId: "",
    socketId: '',
    userList: []
  }),
  mounted() {
    const room = this.$route.params.roomName;
    const socket = io(`http://192.168.124.84:3000?room=${room}`);
    this.socket = socket;
    // let iceServer = { };

    const localVideo = this.$refs.localVideo;
    const remoteVideo = this.$refs.remoteVideo;

    // 发起方的设置
    socket.on("initiator", (initiatorId) => {
      console.log("################", initiatorId);
      this.initiator = true;
      this.initiatorId = initiatorId;
    });

    // 本地peer
    const pc1 = new RTCPeerConnection();
    const pc2 = new RTCPeerConnection();


    socket.on('candidate', data => {
      const { candidate, target } = data

      if(target === 'pc1') {
         pc1.addIceCandidate(candidate)
      } else if(target === 'pc2') {
         pc2.addIceCandidate(candidate)
      }
    })

    pc1.onicecandidate = (e) => {
      console.log("candidate", e.candidate);
      if (!e.candidate) {
        return;
      }

      const [remoteId] = this.userList.filter(item => item !== this.socketId )
      socket.emit("candidate", { id: remoteId, candidate: e.candidate, target: 'pc2' });
    };

    //
    pc2.onicecandidate = (e) => {
      console.log("candidate", e.candidate);
      if (!e.candidate) {
        return;
      }
      const [remoteId] = this.userList.filter(item => item !== this.socketId )
      socket.emit("candidate", { id: remoteId, candidate: e.candidate, target: 'pc1' });
    };
    pc1.oniceconnectionstatechange = (e) =>
      this.onIceStateChange(pc1, e, "pc1");
    socket.on("broadcast", async (data) => {
      console.log(data, this.initiator);
      const {
        count,
        rooms: [receiver],
        users = {}
      } = data;

      if (count === 2 && this.initiator) {
        console.log("我进去了吗");
        this.userList = Object.keys(users.sockets)
        const offer = await pc1.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc1.setLocalDescription(offer);
        socket.emit("offer", {
          initiatorId: this.initiatorId,
          receiver,
          offer,
        });
      }
    });

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      localVideo.srcObject = stream;
      console.log(stream);

      //localStream = stream;
      stream.getTracks().forEach((track) => {
        pc1.addTrack(track, stream);
        pc2.addTrack(track, stream);
      });
      this.localStream = stream;
    });

    socket.on('socketId', socketId => {
      this.socketId = socketId
    })

    // 接收者对发送端的回复
    socket.on("answer", (data) => {
      console.log("我收到答案了", data.answer);
      pc1.setRemoteDescription(data.answer);
    });

    // ----------------------------------------------------------------------------------

    // 远程peer
    // const pc2 = new RTCPeerConnection(iceServer);
    pc2.oniceconnectionstatechange = (e) =>
      this.onIceStateChange(pc2, e, "pc2");
    pc2.addEventListener("track", (e) => {
      console.log("我能接收到视频吗？", e);
      console.log(e.streams[0]);
      remoteVideo.srcObject = e.streams[0];
      // remoteVideo.play();
    });

    pc1.addEventListener("track", (e) => {
      console.log("我能接收到视频吗？", e);
      console.log(e.streams[0]);
      remoteVideo.srcObject = e.streams[0];
      // remoteVideo.play();
    });

    socket.on("offer", async ({ initiatorId, offer, receiver }) => {
      await pc2.setRemoteDescription(offer);
      const answer = await pc2.createAnswer();
      await pc2.setLocalDescription(answer);
      console.log("设置远程视频");
      socket.emit("answer", { answer, initiatorId, receiver });
    });

    // pc.onaddstream = (data) => {
    //   console.log("i am data", data);

    //   const dom = this.$refs.videoList;
    //   const video = document.createElement("video");
    //   video.controls = true;
    //   video.autoplay = "autoplay";
    //   dom.append(video);
    //   video.srcObject = data.stream;
    // };

    // pc.onicecandidate = (event) => {
    //   console.log("ice", event);
    // };

    // pc.ontrack = (ev) => {
    //   console.log("我enter了");
    //   ev.streams.forEach((stream) => console.log(stream));
    // };

    // navigator.mediaDevices
    //   .getUserMedia({
    //     video: true,
    //   })
    //   .then(async (stream) => {
    //     this.localstream = await navigator.mediaDevices.getUserMedia({
    //       video: true,
    //     });

    //     pc.onaddstream({ stream });
    //     pc.addStream(stream);
    //   });

    // // 发起方的设置
    // socket.on("initiator", (initiatorId) => {
    //   this.initiator = true;
    //   this.initiatorId = initiatorId;
    // });

    // socket.on("offer", async ({ initiatorId, offer, receiver }) => {
    //   // const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    //   pc.setRemoteDescription(
    //     new RTCSessionDescription(offer),
    //     () => {
    //       pc.createAnswer((answer) => {
    //         pc.setLocalDescription(
    //           new RTCSessionDescription(answer),
    //           () => {
    //             console.log("I am answer");
    //             socket.emit("answer", { answer, initiatorId, receiver });
    //           },
    //           this.error
    //         );
    //       }, this.error);
    //     },
    //     this.error
    //   );
    // });

    // // 接收者对发送端的回复
    // socket.on("answer", (data) => {
    //   console.log("我收到答案了", data.answer);
    //   pc.setRemoteDescription(data.answer);
    // });

    // socket.on("broadcast", (data) => {
    //   console.log(data);
    //   const {
    //     count,
    //     rooms: [receiver],
    //   } = data;

    //   if (count === 2 && this.initiator) {
    //     console.log("我进来了吗");
    //     pc.createOffer((offer) => {
    //       pc.setLocalDescription(
    //         new RTCSessionDescription(offer),
    //         () => {
    //           console.log("send offer");
    //           // send the offer to a server to be forwarded to the friend you're calling.
    //           socket.emit("offer", {
    //             initiatorId: this.initiatorId,
    //             receiver,
    //             offer,
    //           });
    //         },
    //         this.error
    //       );
    //     }, this.error);
    //   }
    // });
    socket.on("disconnect", function() {});
  },
  methods: {
    onIceStateChange(pc, event, str) {
      if (pc) {
        console.log(`${str} ICE state: ${pc.iceConnectionState}`);
        console.log("ICE state change event: ", event);
      }
    },
    error: function() {
      var videos = document.getElementsByTagName("video");
      for (var i = 0; i < videos.length; i++) {
        videos[i].pause();
      }

      this.pc.close();
    },
  },
  beforeRouteLeave(to, from, next) {
    console.log("i am leave chatRoom");
    this.socket.close();
    next();
  },
};
</script>
