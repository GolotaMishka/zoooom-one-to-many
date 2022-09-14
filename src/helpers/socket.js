import { io } from 'socket.io-client';

const options = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout : 10000,
  transports : ["websocket"]
}

// const socket = io('wss://zoooom-one-to-many.herokuapp.com', options);
const socket = io('ws://localhost:4000', options);

export default socket;