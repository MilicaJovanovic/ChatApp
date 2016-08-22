//Koristi se localStorage kako bi se sesija ponovo uspostavila
//na svim fajlovima (stranicama) koje koriste fajl socketChat
var hn_en = localStorage.getItem('hn_en');
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
        var doesConnectionExist = localStorage.getItem('socket');
        //Provera da se ne radi duplo logovanje
        if (doesConnectionExist != 'true') {
            var object = {
                type: "request_login",
                name: email,
                password: session_id,
                ip: myip
            }

            websocket.send(JSON.stringify(object));
        }
      }
    } else if (input.type == "response_login_status") {
      if (input.login == 1) {
        //Obelezje u localStorage po kojem se pamti da li je ovo
        //login stranica ili bilo koja druga stranica
        localStorage.setItem('socket', 'true');
        location.href = "chat.html";
      } else {
        alert("Unable to Authenticate to Server!");
        angular.element(document.getElementById('body')).scope().shutDown();
      }
  } else if (input.type == "response_logout_status") {
      if (input.logout == 1) {
          localStorage.removeItem('socket');
          location.href = "index.html";
      } else {
          alert("Logout Failed");
      }
  }
};

websocket.onerror = function(ev) {
    //TO DO
    //Dodati logiku sta se desava svaki put kad socket baci neku gresku
};

//Kod pomeren tako da moze da se reaguje na dugmice i pristupi kodu
//sa svake stranice koja koristi fajl socketChat.js
jQuery(document).ready(function() {
    // Zavrsena logika za logout
    //TO DO JSON nije dobar
    $("#logoutBtn").click(function() {
      alert("Are you sure?");
      var object = {
        type : "request_logout"
      }
      websocket.send(JSON.stringify(object));
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
    //Trenutno zakomentarisano jer ne radi
    // $("#agentName").html(input.agentDisplayName);
});
