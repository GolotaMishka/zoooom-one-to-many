const express = require('express');
const path = require('path');
const {version, validate} = require('uuid');
const bodyParser = require('body-parser');
// var cors = require('cors')
const app = express();
const http = require('http');
const webrtc = require("wrtc");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 4000;
const appPaths = require('./config/paths');
const { ACTIONS } = require('./src/constants/actions');
const { RTCConfig } = require('./src/constants/rtc-config')

let senderStream;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function getClientRooms() {
  const {rooms} = io.sockets.adapter;

  return Array.from(rooms.keys()).filter(roomID => validate(roomID) && version(roomID) === 4);
}

function shareRoomsInfo() {
  io.emit(ACTIONS.SHARE_ROOMS, {
    rooms: getClientRooms()
  })
}

io.on('connection', socket => {
  shareRoomsInfo();

  socket.on(ACTIONS.JOIN, config => {
    const {room: roomID} = config;
    const {rooms: joinedRooms} = socket;

    if (Array.from(joinedRooms).includes(roomID)) {
      return console.warn(`Already joined to ${roomID}`);
    }

    const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

    clients.forEach(clientID => {
      io.to(clientID).emit(ACTIONS.ADD_PEER, {
        peerID: socket.id,
        createOffer: false
      });

      socket.emit(ACTIONS.ADD_PEER, {
        peerID: clientID,
        createOffer: true,
      });
    });

    socket.join(roomID);
    shareRoomsInfo();
  });

  function leaveRoom() {
    const {rooms} = socket;

    Array.from(rooms)
      // LEAVE ONLY CLIENT CREATED ROOM
      .filter(roomID => validate(roomID) && version(roomID) === 4)
      .forEach(roomID => {

        const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

        clients
          .forEach(clientID => {
          io.to(clientID).emit(ACTIONS.REMOVE_PEER, {
            peerID: socket.id,
          });

          socket.emit(ACTIONS.REMOVE_PEER, {
            peerID: clientID,
          });
        });

        socket.leave(roomID);
      });

    shareRoomsInfo();
  }

  socket.on(ACTIONS.LEAVE, leaveRoom);
  socket.on('disconnecting', leaveRoom);

  socket.on(ACTIONS.RELAY_SDP, ({peerID, sessionDescription}) => {
    io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
      peerID: socket.id,
      sessionDescription,
    });
  });

  socket.on(ACTIONS.RELAY_ICE, ({peerID, iceCandidate}) => {
    io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
      peerID: socket.id,
      iceCandidate,
    });
  });

  // TODO: Rewrite with http
  socket.on(ACTIONS.BROADCAST, async ({room, sdp}) => {
    const peer = new webrtc.RTCPeerConnection(RTCConfig);
    peer.ontrack = (e) => {
        senderStream = e.streams[0];
    };

    const remoteDescription = new webrtc.RTCSessionDescription(sdp);
    await peer.setRemoteDescription(remoteDescription);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }

    socket.emit(ACTIONS.ADD_BROADCASTER_PEER, payload);
  });

  app.post('/broadcast', async ({ body }, res) => {
    const peer = new webrtc.RTCPeerConnection(RTCConfig);
    peer.ontrack = (e) => {
        senderStream = e.streams[0];
    };
    peer.onicecandidate = event => {
      if (event.candidate) {
        socket.emit(ACTIONS.SEND_ICE_CANDIDATE_TEACHER_STREAM, {
          iceCandidate: event.candidate,
        });
      }
    }

    socket.on(ACTIONS.SEND_ICE_CANDIDATE_TEACHER_SERVER_STREAM, ({iceCandidate}) => {
      peer.addIceCandidate(
        new webrtc.RTCIceCandidate(iceCandidate)
      );
    })
  
    const remoteDescription = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(remoteDescription);
  
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }
    res.json(payload);
  });
  
  app.post("/watch", async ({ body }, res) => {
    const peer = new webrtc.RTCPeerConnection(RTCConfig);
    peer.onicecandidate = event => {
      if (event.candidate) {
        console.log(event.candidate);

        socket.emit(ACTIONS.SEND_ICE_CANDIDATE_STUDENT_STREAM, {
          iceCandidate: event.candidate,
        });
      }
    }

    socket.on(ACTIONS.SEND_ICE_CANDIDATE_STUDENT_SERVER_STREAM, ({iceCandidate}) => {
      peer.addIceCandidate(
        new webrtc.RTCIceCandidate(iceCandidate)
      );
    })
    const remoteDescription = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(remoteDescription);
    senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }
    res.json(payload);
  });

});



app.use(express.static(appPaths.outputPath));
app.get('*', (_, res) => res.sendFile(path.join(appPaths.outputPath, 'index.html')));

server.listen(PORT, () => console.log(`App is now running on ${PORT}`));
