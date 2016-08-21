var websocket;

function openWebSocket(hn_en) {
  var wsUrl = 'wss://' + hn_en + '/websocket/chatclient';
  websocket = websocket = new WebSocket(wsUrl);
}

function sendSocketMessage(userEmail, userPassword, userIp) {
  var object = {
    type: "request_login",
    email: userEmail,
    password: userPassword,
    ip: userIp
  }

  websocket.send(JSON.stringify(object));
}

// websocket.onmessage = function(ev) {
//     var input = JSON.parse(ev.data);
//     console.log(input);
// };
