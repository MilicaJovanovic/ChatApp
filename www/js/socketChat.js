var wsUrl = 'wss://' + hn_en + '/websocket/agentlogin';
var websocket = new WebSocket(wsUrl);
var soundClicked;
var vibrationClicked;

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

        websocket.send(JSON.stringify(object));
      }
    } else if (input.type == "response_login_status") {
      if (input.login == 1) {
        location.href = "chat.html";

        // Nedovrsena logika za logout
        $("#logoutBtn").click(function() {
          alert("Are you sure?");
          var object = {
            type : "request_login"
          }
          websocket.send(JSON.stringify(object));

          if (input.type.equals("response_logout_status")) {
            if (input.logout == 1) {
              location.href = "index.html";
            } else {
              alert("Logout failed");
            }
          }
        });

        // Logika za zvuk
        soundClicked = true;
        $("#soundBtn").click(function() {
            if (soundClicked) {
              soundClicked = false;
            } else {
              soundClicked = true;
            }
            console.log(soundClicked);
        });

        // Logika za vibraciju
        vibrationClicked = true;
        $("#vibrationBtn").click(function() {
            if (vibrationClicked) {
              vibrationClicked = false;
            } else {
              vibrationClicked = true;
            }
            console.log(vibrationClicked);
        });

        // Logika za agent name
        $("#agentName").html(input.agentDisplayName);
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
