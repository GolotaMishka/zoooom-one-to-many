const ACTIONS = {
    BROADCAST: 'broadcast',
    ADD_BROADCASTER_PEER: 'add-broadcaster-peer',
    SEND_ICE_CANDIDATE_TEACHER_STREAM: 'send-ice-candidate-teacher-stream',
    SEND_ICE_CANDIDATE_TEACHER_SERVER_STREAM: 'send-ice-candidate-teacher-server-stream',

    SEND_ICE_CANDIDATE_STUDENT_STREAM: 'send-ice-candidate-student-stream',
    SEND_ICE_CANDIDATE_STUDENT_SERVER_STREAM: 'send-ice-candidate-student-server-stream',

    WATCH: 'watch',
    ADD_WATCHER_PEER: 'add-watcher-peer',
    
    JOIN: 'join',
    LEAVE: 'leave',
    SHARE_ROOMS: 'share-rooms',
    ADD_PEER: 'add-peer',
    REMOVE_PEER: 'remove-peer',
    RELAY_SDP: 'relay-sdp',
    RELAY_ICE: 'relay-ice',
    ICE_CANDIDATE: 'ice-candidate',
    SESSION_DESCRIPTION: 'session-description'
  };
  
module.exports.ACTIONS = ACTIONS;