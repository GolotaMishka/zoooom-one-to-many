const ACTIONS = {
  BROADCAST: "broadcast",
  ADD_BROADCASTER_PEER: "add-broadcaster-peer",

  SEND_ICE_CANDIDATE_TEACHER_STREAM: "send-ice-candidate-teacher-stream",
  SEND_ICE_CANDIDATE_TEACHER_SERVER_STREAM:
    "send-ice-candidate-teacher-server-stream",

  SEND_ICE_CANDIDATE_STUDENT_STREAM: "send-ice-candidate-student-stream",
  SEND_ICE_CANDIDATE_STUDENT_SERVER_STREAM:
    "send-ice-candidate-student-server-stream",

  WATCH: "watch",
  ADD_WATCHER_PEER: "add-watcher-peer",
};

module.exports.ACTIONS = ACTIONS;
