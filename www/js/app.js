// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var username;
var password;
var app = angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform, $rootScope) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    $rootScope.$on('$cordovaLocalNotification:schedule',
      function(event, notification, state) {
        console.log("SCHEDULE");
        console.log('event', event);
        console.log('notification', notification);
        console.log('state', state);
      });

    $rootScope.$on('$cordovaLocalNotification:trigger',
      function(event, notification, state) {
        console.log("TRIGGER");
        console.log('event', event);
        console.log('notification', notification);
        console.log('state', state);
      });

    $rootScope.$on('$cordovaLocalNotification:update',
      function(event, notification, state) {
        console.log('UPDATE');
        console.log('event', event);
        console.log('notification', notification);
        console.log('state', state);
      });

    $rootScope.$on('$cordovaLocalNotification:cancel',
      function(event, notification, state) {
        console.log('CANCEL');
        console.log('event', event);
        console.log('notification', notification);
        console.log('state', state);
      });
  });
})

app.controller("LoginController", function($scope, $ionicPlatform, $cordovaVibration, $cordovaLocalNotification, $rootScope, $cordovaNetwork) {

  $ionicPlatform.ready(function() {

    $scope.checkInteret = function() {
      return $cordovaNetwork.isOnline();
    }

    $scope.scheduleInstantNotification = function(text, title) {
      $cordovaLocalNotification.schedule({
        id: 1,
        text: text,
        title: title,
        sound: 'http://dusannesicdevelopment.sytes.net/webAndroid/res/nonSilent.mp3'
      }).then(function() {
        console.log("Instant Notification set");
      });;
    };

    $scope.scheduleInstantNotificationSilent = function(text, title) {
      $cordovaLocalNotification.schedule({
        id: 1,
        text: text,
        title: title,
        sound: 'http://dusannesicdevelopment.sytes.net/webAndroid/res/silent.mp3'
      }).then(function() {
        console.log("Instant Notification set");
      });;
    };

      $scope.vibrateNow = function() {
        $cordovaVibration.vibrate(500);
      }
  });

  $ionicPlatform.registerBackButtonAction(function(event) {
    if (window.location == "file:///android_asset/www/index.html") {
        localStorage.clear();
        navigator.app.exitApp();
    } else {
      $('#yesNoModal').modal('show');
      $("#btnYes").click(function() {
        logout();
      });
      $("#btnNo").click(function() {
        $('#yesNoModal').modal('hide');
      });
    }
  }, 100);

  function load_js() {
    var head= document.getElementsByTagName('head')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= 'js/socketChat.js';
    head.appendChild(script);
  }

  $scope.shutDown = function() {
    navigator.app.exitApp();
  }

  jQuery("#loginBtn").click(function(){
      username = jQuery('#username').val();
      password = jQuery('#password').val();

      localStorage.setItem('username', username);
      localStorage.setItem('password', password);

      if (username != "" && isValidEmailAddress(username)) {
        if (password != "") {
          var object = {
            username : username,
            password : password
          }

          var data = JSON.stringify(object);
          $.post('https://portal.conversity.net/app/mobclient/xmpp_login.php', data, function(response) {
            if(response.status == 2) {
              $("#alertAccDsbl").delay(200).hide(0, function() {
                 $("#alertAccDsbl").fadeIn().delay(1300).fadeOut(300);
               });
            } else if (response.status == 0) {
              $("#alertLogDet").delay(200).hide(0, function() {
                 $("#alertLogDet").fadeIn().delay(1300).fadeOut(300);
             });
            } else if (response.status == 1) {
              localStorage.setItem('hn_en', response.hn_en);
              // localStorage.setItem('session_id', response.session_id);
              localStorage.setItem('email', response.email);
              window.location = "chat.html";
            }
          });
        } else {
          $("#alertPass").delay(200).hide(0, function() {
             $("#alertPass").fadeIn().delay(1300).fadeOut(300);
         });
        }
      } else {
        $("#alertUsr").delay(200).hide(0, function() {
             $("#alertUsr").fadeIn().delay(1300).fadeOut(300);
         });
      }
  });
});

function isValidEmailAddress(emailAddress) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(emailAddress);
};
