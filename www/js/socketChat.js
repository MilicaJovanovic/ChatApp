var wsUrl = 'wss://' + hn_en + '/websocket/agentlogin';
var websocket = new WebSocket(wsUrl);

websocket.onopen = function(ev) {
  //TO DO
  //Logika koja se desava kada se otvori soket
}

websocket.onclose = function(ev) {
    //TO DO
    //Dodati logiku koja se desava svaki put kad se soket ugasi
};

websocket.onmessage = function(ev) {
    var input = JSON.parse(ev.data);
    console.log(input);

    if (input.type == "response_session_opened") {
      if (input.status == 0) {
        alert("Unable to Connect to Server!");
        angular.element(document.getElementById('body')).scope().shutDown();
      } else {
        var object = {
          type: "request_login",
          name: email,
          password: session_id,
          ip: myip
        }

        console.log("Trying to log on: " + wsUrl);
        websocket.send(JSON.stringify(object));
      }
    } else if (input.type == "response_login_status") {
      if (input.login == 1) {
        //TO DO
        //Napisati logiku kada je login uspesan
      } else {
        alert("Unable to Authenticate to Server!");
        angular.element(document.getElementById('body')).scope().shutDown();
      }
    }
};

websocket.onerror = function(ev) {
    //TO DO
    //Dodati logiku sta se desava svaki put kad socket baci neku gresku
};
