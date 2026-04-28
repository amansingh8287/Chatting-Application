// import { io } from "socket.io-client";

// const URL = "http://localhost:5000";

// export const socket = io(URL, {
//   autoConnect: false,
// });

import { io } from "socket.io-client";

export const socket = io("https://chatting-application-wej7.onrender.com", {
  autoConnect: false,
});