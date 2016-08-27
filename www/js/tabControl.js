$(document).ready(function() {
    $("#btnSend").click(function() {
        $('<li role="presentation"><a href="#profile" aria-controls="profile" role="tab" data-toggle="tab">Customer 2</a></li>').appendTo("#tabs");
    });

});
websocket.onmessage = function(ev) {
    var input = JSON.parse(ev.data);

    if (input.type == "response_new_chat_alert") {
        $('<li role="presentation"><a href="#' + input.chatVisitorName + '" aria-controls="profile" role="tab" data-toggle="tab">' + input.chatVisitorName + '</a></li>').appendTo("#tabs");
    }
}
