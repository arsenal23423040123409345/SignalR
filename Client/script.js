var connectButton = document.getElementById("connectButton");
var closeButton = document.getElementById("closeButton");
var sendButton = document.getElementById("sendButton");

var stateLabel = document.getElementById("stateLabel");
var connIdLable = document.getElementById("connIdLable");
var connectionUrl = document.getElementById("connectionUrl");
var sendMessage = document.getElementById("sendMessage");
var commsLog = document.getElementById("commsLog");
var recipents = document.getElementById("recipents");

connectionUrl.value = "http://localhost:5000/chathub";

var hubConnection = new signalR.HubConnectionBuilder().withUrl(connectionUrl.value).build();

connectButton.onclick = function () {
    stateLabel.innerHTML = "Attempting to connect...";

    hubConnection.start().then(function () {
        updateState();
        commsLog.innerHTML += '<tr>' + '<td colspan="3">Connection opened</td>' + '</tr>';
    });
}

closeButton.onclick = function () {
    validateSignalRSocket(hubConnection);

    hubConnection.stop().then(function () {
        console.debug("Requested stop on hub")
    });
}

sendButton.onclick = function () {
    var message = constructJSON();

    hubConnection.invoke("SendMessageAsync", message);

    commsLog.innerHTML += '<tr>' + '<td>Server</td>' + '<td>Client</td>' + '<td></td></tr>';
}

hubConnection.onclose(function (event) {
    updateState();
    commsLog.innerHTML += '<tr><td colspan="3">Connection closed.</td></tr>';
});

hubConnection.on("ReceiveConnectionId", function (connId) {
    connIdLable.innerHTML = `Connection Id: ${connId}`;
    commsLog.innerHTML += '<tr><td colspan="3">Connection Id have been received from hub.</td></tr>';
});

hubConnection.on("ReceiveMessage", function (message) {
    commsLog.innerHTML += '<tr><td>Server</td><td>Client</td><td>' + htmlEscape(message) + '</td></tr>';
});

function validateSignalRSocket(hubConnection) {
    if (!hubConnection || hubConnection.state !== "Connected") {
        alert("SignalR hub not connected!");
    }
}

function constructJSON() {
    return JSON.stringify({
        "From": connIdLable.innerHTML.substring(13, connIdLable.innerHTML.length),
        "To": recipents.value,
        "Message": sendMessage.value
    });
}

function htmlEscape(str) {
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

function updateState() {

    function disable() {
        sendMessage.disabled = true;
        sendButton.disabled = true;
        closeButton.disabled = true;
        recipents.disabled = true;
    }

    function enable() {
        sendMessage.disabled = false;
        sendButton.disabled = false;
        closeButton.disabled = false;
        recipents.disabled = false;
    }

    connectionUrl.disabled = true;
    connectButton.disabled = true;

    if (!hubConnection) {
        disable();
    } else {
        switch (hubConnection.state) {
            case "Disconnected":
                stateLabel.innerHTML = "Closed";
                connIdLable.innerHTML = "ConnId: N/a";
                connectionUrl.disabled = false;
                connectButton.disabled = false;
                disable();
                break;
            case "Connected":
                stateLabel.innerHTML = "Open";
                enable();
                break;
            default:
                stateLabel.innerHTML = "Unknown SignalR State";
                disable();
                break;
        }
    }
}