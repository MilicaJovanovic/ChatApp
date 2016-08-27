//Koristi se localStorage kako bi se sesija ponovo uspostavila
//na svim fajlovima (stranicama) koje koriste fajl socketChat
var hn_en = localStorage.getItem('hn_en');
var wsUrl = 'wss://' + hn_en + '/websocket/agentlogin';
var websocket = new WebSocket(wsUrl);
var soundClicked;
var vibrationClicked;
var currentSelectedSession;

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

    var time = new Date();
    var hours = time.getHours();
    var minutes = time.getMinutes();

    if (minutes < 10) {
        var finalTime = hours + ":0" + minutes;
    } else {
        var finalTime = hours + ":" + minutes;
    }

    if (input.type == "response_session_opened") {
      if (input.status == 0) {
          $("#alertUnConSrv").delay(200).hide(0, function() {
          	$("#alertUnConSrv").fadeIn().delay(1300).fadeOut(300);
          });
        angular.element(document.getElementById('body')).scope().shutDown();
      } else {
        var doesConnectionExist = localStorage.getItem('socket');
        console.log(doesConnectionExist + " KONEKCIJA");
        //Provera da se ne radi duplo logovanje
        if (doesConnectionExist != 'true') {
            var object = {
                type: "request_login",
                name: localStorage.getItem('email'),
                password: localStorage.getItem('session_id'),
                ip: myip
            }

            websocket.send(JSON.stringify(object));
        } else {
            var object = {
                type: "request_relogin",
                sessionID: localStorage.getItem('sessionID'),
                agentID: localStorage.getItem('agentID'),
                clientID: localStorage.getItem('clientID'),
                ip: myip
            }

            websocket.send(JSON.stringify(object));
        }
      }
    } else if (input.type == "response_login_status") {
      if (input.login == 1) {
        //Obelezje koje omogucava da se stranica
        //refresuje bez da se sesija gubi

        //Logika parsovanja Canned Poruka
        localStorage.setItem('agentDisplayName', input.agentDisplayName);

        var realCannedMessages = [];
        var cannedMessages = input.cannedMessages;
        for (var i = 0; i < 100; i++) {
          if (cannedMessages["Sales Team"][i] != null) {
            realCannedMessages.push(i);
            realCannedMessages.push(cannedMessages["Sales Team"][i]);
          }
        }
        localStorage.setItem('cannedMessages', realCannedMessages);

        localStorage.setItem('socket', 'true');
        localStorage.setItem('sessionID', input.sessionID);
        localStorage.setItem('agentID', input.agentID);
        localStorage.setItem('clientID', input.clientID);
      } else {
          $("#alertUnAutSrv").delay(200).hide(0, function() {
              $("#alertUnAutSrv").fadeIn().delay(1300).fadeOut(300);
          });
        angular.element(document.getElementById('body')).scope().shutDown();
      }

      setTimeout(function() {
          // Logika za agent name
          var agentDisplayName = localStorage.getItem('agentDisplayName');
          $("#agentName").html(agentDisplayName);

          //Logika za prikaz canned messages
          var realCannedMessages = localStorage.getItem('cannedMessages');
          var selectValues;
          if (realCannedMessages != null) {
            selectValues = realCannedMessages.split(',');
          }
          var counter = 1;
          $.each(selectValues, function(key, value) {
            if(counter % 2 == 0) {
              $('#cannedMessageSelect')
                  .append($("<option></option>")
                             .attr("value", value)
                             .text(value));
            }
            counter++;
          });

          $('#cannedMessageSelect').on('change', function (e) {
              var optionSelected = $("option:selected", this);
              var valueSelected = this.value;
              var selectedId;
              $.each(selectValues, function(key, value) {
                if(valueSelected === value) {
                  console.log("Tekst: " + valueSelected);
                  selectedId = selectValues.prev();
                  console.log("ID: " + selectedId);
                }
              });

            $("#userTextMessage").val($('#userTextMessage').val() + valueSelected);
          });
      }, 1000);
  } else if (input.type == "response_logout_status") {
      if (input.logout == 1) {
          localStorage.removeItem('socket');
          location.href = "index.html";
      } else {
        $("#alertLogout").delay(200).hide(0, function() {
        	$("#alertLogout").fadeIn().delay(1300).fadeOut(300);
        });
      }
  } else if (input.type == "response_new_chat_alert") {
      //Kada dodje nova sesija (chat) onda se baza updatuje
      var currentChats = JSON.parse(localStorage.getItem('currentChats'));
      var tempChats = [];
      if (currentChats != null) {
          tempChats = currentChats;
      }
      var newChat = {
          clientID : input.clientID,
          chatSessionID : input.chatSessionID,
          chatVisitorName : input.chatVisitorName,
          chatType : input.chatType
      }
      tempChats.push(newChat);
      localStorage.removeItem('currentChats');
      localStorage.setItem('currentChats', JSON.stringify(tempChats));

      $('<li id="' + newChat.chatSessionID + '" role="presentation"><a href="#' + input.chatVisitorName + '" aria-controls="profile" role="tab" data-toggle="tab">' + input.chatVisitorName + '</a></li>').appendTo(".nav-pills");

      addListeners();
  } else if (input.type == "response_remove_chat_alert") {
      var currentChats = JSON.parse(localStorage.getItem('currentChats'));
      if (currentChats != null) {
          var index = -1;
          for (var i = 0; i < currentChats.length; i++) {
              if (currentChats[i].clientID == input.clientID) {
                  index = i;
              }
          }
          currentChats.splice(index, 1);
          var tempChats = currentChats;
          localStorage.removeItem('currentChats');
          localStorage.setItem('currentChats', JSON.stringify(tempChats));

          console.log("Removed the chat: " + index);

          //TO DO - obrisati i tab na grafici
      }
  }
  // } else if (primljena poruka) {
  //     //TO DO razlikovati posebne chatove
  //
  //     $('<div class="chat-list"><aside class="chat-content"><p class="small chat-title">' + currentSelectedUsername + '<span class="pull-right">' + finalTime + '</span></p><p>' + chatMessage + '</p></aside><div class="clearfix"></div></div>').appendTo(#chat-container);
  // } else if (poslata poruka) {
  //     //TO DO razlikovati posebne chatove
  //
  //     $('<div class="chat-list-alter"><aside class="chat-content"><p class="small chat-title">' + currentSelectedUsername + '<span class="pull-right">' + finalTime + '</span></p><p>' + chatMessage + '</p></aside><div class="clearfix"></div></div>').appendTo(#chat-container);
  // }
};

websocket.onerror = function(ev) {
    //TO DO
    //Dodati logiku sta se desava svaki put kad socket baci neku gresku
};

//Ostale funkcije koje nisu deo soketa i jQuery-ja
//Funkcija koja dodaje click listenere na tabove
//automatski kada se pokrene novi cha
function addListeners() {
    var listItems = document.getElementsByTagName('li');
    var itemsSize = listItems.length;
    for (var i = 0; i < itemsSize; i++) {
        listItems[i].addEventListener('click', clickResponse, false);
    }
}

//Funkcija koja obelezava odredjeni chat kao aktivan
function clickResponse() {
    var currentChats = JSON.parse(localStorage.getItem('currentChats'));
    var foundChat = {};
    for (var i = 0; i < currentChats.length; i++) {
        if (currentChats[i].chatSessionID == this.id) {
            foundChat = currentChats[i];
            currentChats[i].chatType = "trf";
            break;
        }
    }
    alert(foundChat.chatType);
    if (foundChat != null) {
        if (foundChat.chatType == "new") {
            var object = {
                type: "request_chat_request_accepted",
                chatSessionID: this.id
            }

            alert(this.id);

            websocket.send(JSON.stringify(object));
        }
    }
    currentSelectedSession = this.id;

    var tempChats = currentChats;
    localStorage.removeItem('currentChats');
    localStorage.setItem('currentChats', JSON.stringify(tempChats));
}

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
      localStorage.clear();
      window.location = "index.html";
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

    $("#btnSend").click(function() {
        var message = $("#userInput").val();

        var object = {
            type: "request_chat_message",
            chatSessionID: currentSelectedSession,
            chatMessage: message
        }

        websocket.send(JSON.stringify(object));

        $("#userInput").val("");

        //TO DO - povezati sa grafikom da se iscrtava
    });

    $("#endBtn").click(function() {
        var object = {
            type: "request_endchat_message",
            chatSessionID: currentSelectedSession
        }

        websocket.send(JSON.stringify(object));

        //TO DO - update baze da se obrise taj chat
        //kao sto se desi kada klijent obrise
        //da se obrise i graficki tab
    });
});
