var BOSH_SERVICE = 'https://xm3.conversity.net:5280/http-bind';
var connection = null;

var soundClicked;
var vibrationClicked;
var currentSelectedSession;
var currentSelectedUsername;
var audio = new Audio('http://dusannesicdevelopment.sytes.net/web/res/Alert_NewMsg.mp3');

var time = new Date();
var hours = time.getHours();
var minutes = time.getMinutes();

if (minutes < 10) {
    var finalTime = hours + ":0" + minutes;
} else {
    var finalTime = hours + ":" + minutes;
}

function replaceURLWithHTMLLinks(text) {
   var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
   return text.replace(exp,"<a href='$1' style='color:#fff;' target='blank'>Click to open link</a>");
}

function rawInput(data) {
    // console.log('RECV', data);
}

function rawOutput(data) {
    // console.log('SENT', data);
}

function onConnect(status) {
    if (status == Strophe.Status.CONNECTING) {
	       console.log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
	       console.log('Strophe failed to connect.');
	       $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
	       console.log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
           console.log('Strophe is disconnected.');
           window.location = "index.html";
	$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
    	console.log('Strophe is connected.');

        var currentChats = JSON.parse(localStorage.getItem('activeChats'));
        if (currentChats == null) {
            currentChats = [];
        }
        localStorage.setItem('activeChats', JSON.stringify(currentChats));

        connection.addHandler(onMessage, null,    'message', null, null,  null);
        connection.addHandler(onOwnMessage, null, 'iq', 'set', null,  null);
        connection.send($pres().tree());
    }
}

function sendMessage() {
    var message = $("#userInput").val();
    var to = "dusanapp@conversity.net";
    if(message && to) {
        var reply = $msg({
            to: to,
            type: 'chat'
        })
        .cnode(Strophe.xmlElement('body', message)).up()
        .c('active', {xmlns: "http://jabber.org/protocol/chatstates"});

        connection.send(reply);
    }

    var userMessage = replaceURLWithHTMLLinks(message);
    $('<div style="margin: 20px 7px 0px; position: relative; min-height: 55px;"><aside style="width: calc(100% - 70px); background: #2196F3; float: right; padding: 5px 8px; color: #fff; @include border-radius(5px); -webkit-box-shadow: 1px 5px 8px #cccccc; -moz-box-shadow: 1px 5px 8px #cccccc; -ms-box-shadow: 1px 5px 8px #cccccc; box-shadow: 1px 5px 8px #cccccc;"><p style="margin-bottom:9px !important;">' + "Me" + '<span class="pull-right">' + finalTime + '</span></p><p>' + userMessage + '</p></aside><div class="clearfix"></div></div>').appendTo('#chatsArea');

}

function onOwnMessage(msg) {
  var elems = msg.getElementsByTagName('own-message');
  if (elems.length > 0) {
      var own = elems[0];
      var to = msg.getAttribute('to');
      var from = msg.getAttribute('from');
      var iq = $iq({
    	  to: from,
    	  type: 'error',
    	  id: msg.getAttribute('id')
      })
      .cnode(own).up().c('error', {type: 'cancel', code: '501'})
      .c('feature-not-implemented', {xmlns: 'urn:ietf:params:xml:ns:xmpp-stanzas'});
      connection.sendIQ(iq);
  }
  return true;
}

function onMessage(msg) {
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');
    if (type == "chat" && elems.length > 0) {
    	var body = elems[0];
    	var text = Strophe.getText(body);
        var userMessage = replaceURLWithHTMLLinks(text);

        $('<div style="margin: 20px 0px 0px 8px; position: relative; min-height: 55px;"><aside style=" width: calc(100% - 80px); background: #D8D8D8; float: left; padding: 5px 8px; color: $white; @include border-radius(5px); -webkit-box-shadow: 1px 5px 8px #cccccc; -moz-box-shadow: 1px 5px 8px #cccccc; -ms-box-shadow: 1px 5px 8px #cccccc; box-shadow: 1px 5px 8px #cccccc;"><p style="margin-bottom:9px !important;">' + from + '<span class="pull-right">' + finalTime + '</span></p><p>' + userMessage + '</p></aside><div class="clearfix"></div></div>').appendTo('#chatsArea');

        //Skrolovanje nakon primljene poruke
        var div = $(".chatContainer");
        div.scrollTop(div.prop('scrollHeight'));
    }

    console.log("Function is going to be called!");
    addNewTab(from);

    return true;
}

function addNewTab(from) {
    console.log("Function is called!");

    //Logika kreiranja kartica (tabova) na osnovu username-a posiljaoca poruke
    var currentChats = JSON.parse(localStorage.getItem('activeChats'));
    var found = false;
    for (var i = 0; i < currentChats.length; i++) {
        if (currentChats[i] == from) {
            found = true;
        }
    }

    if (!found) {
        currentChats.push(from);
        $('<li style="width: auto !important" id="' + from + '" role="presentation"><a href="#' + from + '" aria-controls="profile" role="tab" data-toggle="tab">' + from + '</a></li>').appendTo(".nav-pills");
        //Skroluje tabove
        var stab = $(".scroll-tab");
        stab.scrollTop(stab.prop('scrollWidth'));

        $('<section class="chatContainer" style="overflow-x: scroll; overflow-y: scroll; position: fixed;" id="chat' + from + '"></section>').appendTo("#chatsArea");

        // var div = $("#chat" + from);
        // div.scrollTop(div.prop('scrollHeight'));

        // $('<span id="end' + from + '" class="endBtn"><i class="fa fa-times"></i></span>').appendTo(".department-col");
        // $("#end" + from).attr('style', 'display: none !important');

        // $('<span id="close' + from + '" class="closeBtn"><i class="fa fa-minus"></i></span>').appendTo(".department-col");
        // $("#close" + from).attr('style', 'display: none !important');

        var newChats = currentChats;
        localStorage.removeItem('activeChats');
        localStorage.setItem('activeChats', JSON.stringify(newChats));
    }
}

$(document).ready(function () {
    connection = new Strophe.Connection(BOSH_SERVICE, {'keepalive': true});
    connection.rawInput = rawInput;
    connection.rawOutput = rawOutput;

    connection.connect("dusan@conversity.net", "123456", onConnect);

    $("#btnSend").click(function() {
        sendMessage();
    });

    $("#logoutBtn").click(function() {
        var username = localStorage.getItem('username');
        var password = localStorage.getItem('password');

        var object = {
          username : username,
          password : password
        }

        var data = JSON.stringify(object);
        $.post('https://portal.conversity.net/app/mobclient/xmpp_logout.php', data, function(response) {
            if (response.status == 1) {
                alert("You successfully logged out!");
                localStorage.clear();
                connection.disconnect();
            } else {
                alert("There has been an error with logout!");
            }
        });
    });
});
