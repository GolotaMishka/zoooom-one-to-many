import React, { useRef } from "react";
import socket from "./helpers/socket";
import { ACTIONS, RTCConfig } from "./constants";

const Home = () => {
  const videoRef = useRef(null);

  const onStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    });
    let video = videoRef.current;
    video.srcObject = stream;
    const peer = new RTCPeerConnection(RTCConfig);
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit(ACTIONS.SEND_ICE_CANDIDATE_TEACHER_SERVER_STREAM, {
          iceCandidate: event.candidate,
        });
      }
    };

    socket.on(ACTIONS.SEND_ICE_CANDIDATE_TEACHER_STREAM, ({ iceCandidate }) => {
      peer.addIceCandidate(new RTCIceCandidate(iceCandidate));
    });
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit(ACTIONS.BROADCAST, { sdp: peer.localDescription });

    socket.on(ACTIONS.ADD_BROADCASTER_PEER, ({ sdp }) => {
      const remoteDescription = new RTCSessionDescription(sdp);
      peer.setRemoteDescription(remoteDescription).catch((e) => console.log(e));
    });
  };

  return (
    <div>
      <h1>Teacher's page</h1>
      <button type="button" onClick={onStream}>
        Stream
      </button>
      <video
        ref={videoRef}
        autoPlay
        width="100%"
        height="100%"
        playsInline
      ></video>
    </div>
  );
};

export default Home;
