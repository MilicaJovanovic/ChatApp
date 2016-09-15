//Koristi se localStorage kako bi se sesija ponovo uspostavila
//na svim fajlovima (stranicama) koje koriste fajl socketChat
var hn_en = localStorage.getItem('hn_en');
var wsUrl = 'wss://' + hn_en + '/websocket/agentlogin';
var websocket = new WebSocket(wsUrl);
var soundClicked;
var vibrationClicked;
var currentSelectedSession;
var currentSelectedUsername;
var audio = new Audio('http://dusannesicdevelopment.sytes.net/web/res/Alert_NewMsg.mp3');

function replaceURLWithHTMLLinks(text) {
   var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
   return text.replace(exp,"<a href='$1' style='color:#fff;' target='blank'>Click to open link</a>");
}

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
        var thereisNet = localStorage.getItem('socket');
        //Provera da se ne radi duplo logovanje
        if (thereisNet != 'true') {
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
            var newCannedMessage = {
              id : i,
              message : cannedMessages["Sales Team"][i]
            }
            realCannedMessages.push(newCannedMessage);
          }
        }
        localStorage.setItem('cannedMessages', JSON.stringify(realCannedMessages));

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
          var realCannedMessages = JSON.parse(localStorage.getItem('cannedMessages'));
          for (var i = 0; i < realCannedMessages.length; i++) {
            if (realCannedMessages[i].message != null) {
              var value = realCannedMessages[i].message;
              $('#cannedMessageSelect').append($("<option></option>").attr("value", value).text(value));
            }
          }

          $('#cannedMessageSelect').on('change', function (e) {
              var optionSelected = $("option:selected", this);
              var valueSelected = this.value;
              for (var i = 0; i < realCannedMessages.length; i++) {
                if (realCannedMessages[i].message == valueSelected) {
                  var object = {
                    type: "request_canned_message",
                    id: realCannedMessages[i].id
                  }

                  websocket.send(JSON.stringify(object));
                }
              }
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

      $('<li style="width: auto !important" id="' + newChat.chatSessionID + '" role="presentation"><a href="#' + input.chatVisitorName + '" aria-controls="profile" role="tab" data-toggle="tab">' + input.chatVisitorName + '</a></li>').appendTo(".nav-pills");
      //Skroluje tabove
      var stab = $(".scroll-tab");
      stab.scrollTop(stab.prop('scrollWidth'));

      if (document.hidden) {
          if (soundClicked) {
              angular.element($("body")).scope().scheduleInstantNotification(newChat.chatVisitorName, "New Chat");
          } else {
              angular.element($("body")).scope().scheduleInstantNotificationSilent(newChat.chatVisitorName, "New Chat");
          }
          if (vibrationClicked) {
              angular.element($("body")).scope().vibrateNow();
          }
      }
      if (soundClicked) {
          audio.play();
      }
      if (vibrationClicked) {
        angular.element($("body")).scope().vibrateNow();
      }

      $('<section class="chatContainer" style="overflow-x: scroll; overflow-y: scroll; position: fixed;" id="chat' + newChat.chatSessionID + '"></section>').appendTo("#chatsArea");

      var div = $("#chat" + newChat.chatSessionID);
      div.scrollTop(div.prop('scrollHeight'));

      $('<span id="end' + newChat.chatSessionID + '" class="endBtn"><i class="fa fa-times"></i></span>').appendTo(".department-col");
      $("#end" + newChat.chatSessionID).attr('style', 'display: none !important');

      $('<span id="close' + newChat.chatSessionID + '" class="closeBtn"><i class="fa fa-minus"></i></span>').appendTo(".department-col");
      $("#close" + newChat.chatSessionID).attr('style', 'display: none !important');

      addListeners();
      addListenersEnd();
      addListenersClose();
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
      }
  } else if (input.type == "responce_chat_message") {

        var inputtxt = input.chatMessage;
        var userMessage = replaceURLWithHTMLLinks(inputtxt);

      $('<div style="margin: 20px 0px 0px 8px; position: relative; min-height: 55px;"><aside style=" width: calc(100% - 80px); background: #D8D8D8; float: left; padding: 5px 8px; color: $white; @include border-radius(5px); -webkit-box-shadow: 1px 5px 8px #cccccc; -moz-box-shadow: 1px 5px 8px #cccccc; -ms-box-shadow: 1px 5px 8px #cccccc; box-shadow: 1px 5px 8px #cccccc;"><p style="margin-bottom:9px !important;">' + currentSelectedUsername + '<span class="pull-right">' + finalTime + '</span></p><p>' + userMessage + '</p></aside><div class="clearfix"></div></div>').appendTo('#chat' + input.chatSessionID);

      if (input.chatSessionID != currentSelectedSession) {
          var counterExists = $("#count" + input.chatSessionID).length;
          if (counterExists === 0) {
            var currentHtml = $("#" + input.chatSessionID).html();
            var htmlParams = currentHtml.split("</a>");
            var newHtml = htmlParams[0] + " <span id='count" + input.chatSessionID + "' style='background: #ff5858 !important; color: white !important' class='badge'>1</span>" + htmlParams[1];

            $("#" + input.chatSessionID).html(newHtml);
          } else if (counterExists > 0) {
              var currentNumber = $("#count" + input.chatSessionID).html();
              var newNumber = currentNumber;
              newNumber++;
              $("#count" + input.chatSessionID).html(newNumber + "");
          }

          var div = $("#chat" + input.chatSessionID);
          div.scrollTop(div.prop('scrollHeight'));
      }

      //Skrolovanje nakon primljene poruke
      var div = $("#chat" + input.chatSessionID);
      div.scrollTop(div.prop('scrollHeight'));

      if (document.hidden) {
          if (soundClicked) {
              angular.element($("body")).scope().scheduleInstantNotification(userMessage, "New Message");
          } else {
              angular.element($("body")).scope().scheduleInstantNotificationSilent(userMessage, "New Message");
          }
          if (vibrationClicked) {
              angular.element($("body")).scope().vibrateNow();
          }
      }
      if (soundClicked) {
          audio.play();
      }
      if (vibrationClicked) {
        angular.element($("body")).scope().vibrateNow();
      }

  } else if (input.type == "response_chat_accept") {
    var interim = input.interimChatMessages;
    var params = interim.split("|^^|");

    var firstInnerParams = params[0].split("^|^|");
    $('<div style="margin: 20px 0px 0px 8px; position: relative; min-height: 55px;"><aside style=" width: calc(100% - 80px); background: #D8D8D8; float: left; padding: 5px 8px; color: $white; @include border-radius(5px); -webkit-box-shadow: 1px 5px 8px #cccccc; -moz-box-shadow: 1px 5px 8px #cccccc; -ms-box-shadow: 1px 5px 8px #cccccc; box-shadow: 1px 5px 8px #cccccc;"><p style="margin-bottom:9px !important;">' + currentSelectedUsername + '<span class="pull-right">' + finalTime + '</span></p><p>' + firstInnerParams[1] + '</p></aside><div class="clearfix"></div></div>').appendTo('#chat' + input.chatSessionID);

    var secondInnerParams = params[1].split("^|^|");
    $('<div style="margin: 20px 7px 0px; position: relative; min-height: 55px;"><aside style="width: calc(100% - 70px); background: #2196F3; float: right; padding: 5px 8px; color: #fff; @include border-radius(5px); -webkit-box-shadow: 1px 5px 8px #cccccc; -moz-box-shadow: 1px 5px 8px #cccccc; -ms-box-shadow: 1px 5px 8px #cccccc; box-shadow: 1px 5px 8px #cccccc;"><p style="margin-bottom:9px !important;">' + "Me" + '<span class="pull-right">' + finalTime + '</span></p><p>' + secondInnerParams[1] + '</p></aside><div class="clearfix"></div></div>').appendTo('#chat' + currentSelectedSession);
    for (var i = 1; i < params.length-1; i++) {
      if (i % 2 != 0) {
        if (params[i+1].length > 1) {
          var innerParams = params[i+1].split("^|^|");
          $('<div style="margin: 20px 0px 0px 8px; position: relative; min-height: 55px;"><aside style=" width: calc(100% - 80px); background: #D8D8D8; float: left; padding: 5px 8px; color: $white; @include border-radius(5px); -webkit-box-shadow: 1px 5px 8px #cccccc; -moz-box-shadow: 1px 5px 8px #cccccc; -ms-box-shadow: 1px 5px 8px #cccccc; box-shadow: 1px 5px 8px #cccccc;"><p style="margin-bottom:9px !important;">' + currentSelectedUsername + '<span class="pull-right">' + finalTime + '</span></p><p>' + innerParams[1] + '</p></aside><div class="clearfix"></div></div>').appendTo('#chat' + input.chatSessionID);
        }
      } else {
        var innerParams = params[i+1].split("^|^|");
        $('<div style="margin: 20px 7px 0px; position: relative; min-height: 55px;"><aside style="width: calc(100% - 70px); background: #2196F3; float: right; padding: 5px 8px; color: #fff; @include border-radius(5px); -webkit-box-shadow: 1px 5px 8px #cccccc; -moz-box-shadow: 1px 5px 8px #cccccc; -ms-box-shadow: 1px 5px 8px #cccccc; box-shadow: 1px 5px 8px #cccccc;"><p style="margin-bottom:9px !important;">' + "Me" + '<span class="pull-right">' + finalTime + '</span></p><p>' + innerParams[1] + '</p></aside><div class="clearfix"></div></div>').appendTo('#chat' + currentSelectedSession);
      }
    }
  } else if (input.type == "response_canned_message") {
    $("#userInput").val($('#userInput').val() + input.cannedMessageText);
  } else if (input.type == "response_chat_end_message") {
    $('<div style="margin: 20px 0px 0px 80px; position: relative; min-height: 55px;"><aside style=" width: calc(100% - 80px); background: #D8D8D8; float: left; padding: 5px 8px; color: $white; @include border-radius(5px); -webkit-box-shadow: 1px 5px 8px #cccccc; -moz-box-shadow: 1px 5px 8px #cccccc; -ms-box-shadow: 1px 5px 8px #cccccc; box-shadow: 1px 5px 8px #cccccc;"><p style="margin-bottom:9px !important;">' + currentSelectedUsername + '<span class="pull-right">' + finalTime + '</span></p><p>' + input.chatMessage + '</p></aside><div class="clearfix"></div></div>').appendTo('#chat' + input.chatSessionID);

    $("#end" + input.chatSessionID).remove();
    if (currentSelectedSession == input.chatSessionID) {
      $("#close" + input.chatSessionID).attr('style', 'display: block !important');
      $("#userInput").prop('disabled', true);
      $("#cannedMessageSelect").prop('disabled', true);
      $("#btnSend").prop('disabled', true);
    }
  } else if (input.type == "response_endchat_status") {
    $('<div style="margin: 20px 7px 0px; position: relative; min-height: 55px;"><aside style="width: calc(100% - 70px); background: #2196F3; float: right; padding: 5px 8px; color: #fff; @include border-radius(5px); -webkit-box-shadow: 1px 5px 8px #cccccc; -moz-box-shadow: 1px 5px 8px #cccccc; -ms-box-shadow: 1px 5px 8px #cccccc; box-shadow: 1px 5px 8px #cccccc;"><p style="margin-bottom:9px !important;">' + "Me" + '<span class="pull-right">' + finalTime + '</span></p><p>' + input.message + '</p></aside><div class="clearfix"></div></div>').appendTo('#chat' + currentSelectedSession);

    $("#end" + input.chatSessionID).remove();
    $("#close" + input.chatSessionID).attr('style', 'display: block !important');
    $("#userInput").prop('disabled', true);
    $("#cannedMessageSelect").prop('disabled', true);
    $("#btnSend").prop('disabled', true);
  }
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
    if (itemsSize == 1) {
      $("#chat" + listItems[0].id).attr('style', 'display: block !important');
      $("#end" + listItems[0].id).attr('style', 'display: block !important');
      $("#userInput").prop('disabled', false);
      $("#cannedMessageSelect").prop('disabled', false);
      $("#btnSend").prop('disabled', false);

      var currentChats = JSON.parse(localStorage.getItem('currentChats'));
      var foundChat = {};
      for (var i = 0; i < currentChats.length; i++) {
          if (currentChats[i].chatSessionID == listItems[0].id) {
              foundChat = currentChats[i];
          }
      }

      currentSelectedSession = listItems[0].id;
      currentSelectedUsername = foundChat.chatVisitorName;

      var object = {
          type: "request_chat_request_accepted",
          chatSessionID: listItems[0].id
      }
      websocket.send(JSON.stringify(object));
    }
    for (var i = 0; i < itemsSize; i++) {
        listItems[i].addEventListener('click', clickResponse, false);
    }
}

function addListenersEnd() {
  var endBtns = document.getElementsByClassName("endBtn");
  var endSize = endBtns.length;
  for (var i = 0; i < endSize; i++) {
    endBtns[i].addEventListener('click', clickResponseEnd, false);
  }
}

function addListenersClose() {
  var endBtns = document.getElementsByClassName("closeBtn");
  var endSize = endBtns.length;
  for (var i = 0; i < endSize; i++) {
    endBtns[i].addEventListener('click', clickResponseClose, false);
  }
}

//Funkcija koja obelezava odredjeni chat kao aktivan
function clickResponse() {
    var currentChats = JSON.parse(localStorage.getItem('currentChats'));
    var foundChat = {};
    for (var i = 0; i < currentChats.length; i++) {
        if (currentChats[i].chatSessionID == this.id) {
            foundChat = currentChats[i];
        }
    }
    if (foundChat != null) {
        if (foundChat.chatType == "new") {
            var object = {
                type: "request_chat_request_accepted",
                chatSessionID: this.id
            }
            websocket.send(JSON.stringify(object));
        }
    }
    currentSelectedSession = this.id;
    currentSelectedUsername = foundChat.chatVisitorName;

    //Counter koji se nalazi u this.id - vrati na 0 i sakrij

    $(".chatContainer").attr('style', 'display: none !important');
    $("#chat" + this.id).attr('style', 'display: block !important');
    $("#chat" + this.id).scrollTop($("#chat" + this.id).prop('scrollHeight'));
    $(".endBtn").attr('style', 'display: none !important');
    $(".closeBtn").attr('style', 'display: none !important');

    var endExists = $("#end" + this.id).length;
    if (endExists > 0) {
      $("#end" + this.id).attr('style', 'display: block !important');
      $("#userInput").prop('disabled', false);
      $("#cannedMessageSelect").prop('disabled', false);
      $("#btnSend").prop('disabled', false);

      $("#count" + this.id).remove();
    } else {
      $("#close" + this.id).attr('style', 'display: block !important');
      $("#userInput").prop('disabled', true);
      $("#cannedMessageSelect").prop('disabled', true);
      $("#btnSend").prop('disabled', true);
    }

    var tempChats = currentChats;
    localStorage.removeItem('currentChats');
    localStorage.setItem('currentChats', JSON.stringify(tempChats));
}

function clickResponseEnd() {
  $('#yesNoModal').modal('show');
  $("#btnYes").click(function() {
    var object = {
        type: "request_endchat_message",
        chatSessionID: currentSelectedSession
    }
    websocket.send(JSON.stringify(object));
    $('#yesNoModal').modal('hide');
  });
  $("#btnNo").click(function() {
    $('#yesNoModal').modal('hide');
  });
}

function clickResponseClose() {
  var tempId = this.id;
  var realId = tempId.substring(5, tempId.length);

  $('#yesNoModal').modal('show');
  $("#btnYes").click(function() {
    $("#" + realId).remove();
    $("#chat" + realId).remove();
    $("#close" + realId).remove();
    currentSelectedSession = null;
    currentSelectedUsername = null;

    var listItems = document.getElementsByTagName('li');
    var itemsSize = listItems.length;

    if (itemsSize > 0) {
      $("#chat" + listItems[0].id).attr('style', 'display: block !important');
      $("#end" + listItems[0].id).attr('style', 'display: block !important');
      $("#userInput").prop('disabled', false);
      $("#cannedMessageSelect").prop('disabled', false);
      $("#btnSend").prop('disabled', false);

      var currentChats = JSON.parse(localStorage.getItem('currentChats'));
      var foundChat = {};
      for (var i = 0; i < currentChats.length; i++) {
          if (currentChats[i].chatSessionID == listItems[0].id) {
              foundChat = currentChats[i];
          }
      }

      currentSelectedSession = listItems[0].id;
      currentSelectedUsername = foundChat.chatVisitorName;
    }

    $('#yesNoModal').modal('hide');
  });
  $("#btnNo").click(function() {
    $('#yesNoModal').modal('hide');
  });
}

function logout() {
  var object = {
    type : "request_logout"
  }
  websocket.send(JSON.stringify(object));
  localStorage.clear();
  window.location = "index.html";
}

//Kod pomeren tako da moze da se reaguje na dugmice i pristupi kodu
//sa svake stranice koja koristi fajl socketChat.js
jQuery(document).ready(function() {
  //Provera interneta
  setInterval(function(){
      var hasInternet = angular.element($("body")).scope().checkInteret();

      if (!hasInternet) {
          alert("No Internet Connection!");
          $("#userInput").prop('disabled', true);
          $("#cannedMessageSelect").prop('disabled', true);
          $("#btnSend").prop('disabled', true);
          localStorage.setItem('hadNet', 'true');
      } else {
          var hadNet = localStorage.getItem('hadNet');
          if (hadNet == 'true') {
              $("#userInput").prop('disabled', false);
              $("#cannedMessageSelect").prop('disabled', false);
              $("#btnSend").prop('disabled', false);
              setTimeout(function() {
                function load_js() {
                  var head= document.getElementsByTagName('head')[0];
                  var script= document.createElement('script');
                  script.type= 'text/javascript';
                  script.src= '/js/socketChat.js';
                  head.appendChild(script);
                }
                load_js();
              }, 3000);
              localStorage.setItem('hadNet', 'false');
          } else {
            localStorage.setItem('hadNet', 'false');
          }
      }
  }, 5000);

    // Zavrsena logika za logout
    //TO DO JSON nije dobar
    $("#logoutBtn").click(function() {
      $('#yesNoModal').modal('show');
      $("#btnYes").click(function() {
        logout();
      });
      $("#btnNo").click(function() {
        $('#yesNoModal').modal('hide');
      });
    });

    // Logika za zvuk
    soundClicked = true;
    $("#soundBtn").click(function() {
        if (soundClicked) {
          soundClicked = false;
        } else {
          soundClicked = true;
        }
    });

    // Logika za vibraciju
    vibrationClicked = true;
    $("#vibrationBtn").click(function() {
        if (vibrationClicked) {
          vibrationClicked = false;
        } else {
          vibrationClicked = true;
        }
    });

    $("#btnSend").click(function() {
        var message = $("#userInput").val();

        var time = new Date();
        var hours = time.getHours();
        var minutes = time.getMinutes();

        if (minutes < 10) {
            var finalTime = hours + ":0" + minutes;
        } else {
            var finalTime = hours + ":" + minutes;
        }

        var object = {
            type: "request_chat_message",
            chatSessionID: currentSelectedSession,
            chatMessage: message
        }

        websocket.send(JSON.stringify(object));

        var username = $("#agentName").html();
        $("#userInput").val("");

        var inputtxt = message;
        var userMessage = replaceURLWithHTMLLinks(inputtxt);
        $('<div style="margin: 20px 7px 0px; position: relative; min-height: 55px;"><aside style="width: calc(100% - 70px); background: #2196F3; float: right; padding: 5px 8px; color: #fff; @include border-radius(5px); -webkit-box-shadow: 1px 5px 8px #cccccc; -moz-box-shadow: 1px 5px 8px #cccccc; -ms-box-shadow: 1px 5px 8px #cccccc; box-shadow: 1px 5px 8px #cccccc;"><p style="margin-bottom:9px !important;">' + username + '<span class="pull-right">' + finalTime + '</span></p><p>' + userMessage + '</p></aside><div class="clearfix"></div></div>').appendTo('#chat' + currentSelectedSession);

        //Skrolovanje nakon primljene poruke
        var div = $(".chatContainer");
        div.scrollTop(div.prop('scrollHeight'));
    });

    $("#endBtn").click(function() {
      $('#yesNoModal').modal('show');
      $("#btnYes").click(function() {
        var object = {
            type: "request_endchat_message",
            chatSessionID: currentSelectedSession
        }
        websocket.send(JSON.stringify(object));
        $('#yesNoModal').modal('hide');
      });
      $("#btnNo").click(function() {
        $('#yesNoModal').modal('hide');
      });
        //TO DO - update baze da se obrise taj chat
        //kao sto se desi kada klijent obrise
        //da se obrise i graficki tab
    });
});
