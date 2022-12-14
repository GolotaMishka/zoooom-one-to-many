import React, { useRef } from "react";
import socket from "./helpers/socket";
import { ACTIONS, RTCConfig } from "./constants";

const Room = () => {
  const videoRef = useRef(null);

  const onWatch = async () => {
    const peer = new RTCPeerConnection(RTCConfig);
    peer.addTransceiver("video", { direction: "recvonly" });

    peer.ontrack = (e) => {
      let video = videoRef.current;
      video.srcObject = e.streams[0];
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit(ACTIONS.SEND_ICE_CANDIDATE_STUDENT_SERVER_STREAM, {
          iceCandidate: event.candidate,
        });
      }
    };

    socket.on(ACTIONS.SEND_ICE_CANDIDATE_STUDENT_STREAM, ({ iceCandidate }) => {
      console.log("add ice on front");
      peer.addIceCandidate(new RTCIceCandidate(iceCandidate));
    });

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit(ACTIONS.WATCH, { sdp: peer.localDescription });

    socket.on(ACTIONS.ADD_WATCHER_PEER, ({ sdp }) => {
      const remoteDescription = new RTCSessionDescription(sdp);
      peer.setRemoteDescription(remoteDescription).catch((e) => console.log(e));
    });
  };

  return (
    <div>
      <h1>Student's page</h1>
      <button type="button" onClick={onWatch}>
        Watch
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

export default Room;
