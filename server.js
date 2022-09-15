const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const webrtc = require("wrtc");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 4000;
const appPaths = require("./config/paths");
const { ACTIONS } = require("./src/constants/actions");
const { RTCConfig } = require("./src/constants/rtc-config");

let senderStream;

io.on("connection", (socket) => {
  socket.on(ACTIONS.BROADCAST, async ({ sdp }) => {
    const peer = new webrtc.RTCPeerConnection(RTCConfig);
    peer.ontrack = (e) => {
      senderStream = e.streams[0];
    };
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit(ACTIONS.SEND_ICE_CANDIDATE_TEACHER_STREAM, {
          iceCandidate: event.candidate,
        });
      }
    };

    socket.on(
      ACTIONS.SEND_ICE_CANDIDATE_TEACHER_SERVER_STREAM,
      ({ iceCandidate }) => {
        peer.addIceCandidate(new webrtc.RTCIceCandidate(iceCandidate));
      }
    );

    const remoteDescription = new webrtc.RTCSessionDescription(sdp);
    await peer.setRemoteDescription(remoteDescription);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
      sdp: peer.localDescription,
    };
    socket.emit(ACTIONS.ADD_BROADCASTER_PEER, payload);
  });

  socket.on(ACTIONS.WATCH, async ({ sdp }) => {
    const peer = new webrtc.RTCPeerConnection(RTCConfig);
    senderStream
      .getTracks()
      .forEach((track) => peer.addTrack(track, senderStream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit(ACTIONS.SEND_ICE_CANDIDATE_STUDENT_STREAM, {
          iceCandidate: event.candidate,
        });
      }
    };

    socket.on(
      ACTIONS.SEND_ICE_CANDIDATE_STUDENT_SERVER_STREAM,
      ({ iceCandidate }) => {
        peer.addIceCandidate(new webrtc.RTCIceCandidate(iceCandidate));
      }
    );

    const remoteDescription = new webrtc.RTCSessionDescription(sdp);
    await peer.setRemoteDescription(remoteDescription);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
      sdp: peer.localDescription,
    };

    socket.emit(ACTIONS.ADD_WATCHER_PEER, payload);
  });
});

app.use(express.static(appPaths.outputPath));
app.get("*", (_, res) =>
  res.sendFile(path.join(appPaths.outputPath, "index.html"))
);

server.listen(PORT, () => console.log(`App is now running on ${PORT}`));
