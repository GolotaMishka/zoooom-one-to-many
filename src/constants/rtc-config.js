const RTCConfig = {
    iceServers: [
        {
          credential: "a3b7a6ae-3035-11ed-9b7e-0242ac120004",
          username: "xE7_7HZkomYNYpg04tP5gapB_esjpy-uOlbQUxQlrcrh--51akAPLUCOuWEhlVM4AAAAAGMbKJVnb2xvdGFtbQ==",
          urls: [
            "stun:fr-turn1.xirsys.com",
            "turn:fr-turn1.xirsys.com:80?transport=udp",
            "turn:fr-turn1.xirsys.com:3478?transport=udp",
            "turn:fr-turn1.xirsys.com:80?transport=tcp",
            "turn:fr-turn1.xirsys.com:3478?transport=tcp",
            "turns:fr-turn1.xirsys.com:443?transport=tcp",
            "turns:fr-turn1.xirsys.com:5349?transport=tcp"
          ]
        },
    ]
  };
  
  module.exports.RTCConfig = RTCConfig;