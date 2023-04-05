
var ws;
function connectToGameServer() {
    // This function is used to connect the user to the game server.
    return new Promise((resolve, reject) => {

        var username = document.getElementById('username-text').value;
        if (username == '') {
            alert('Please enter a username');
            return;
        }

        const gameCode = location.pathname.replace('/', '');
        const ip = location.hostname;

        console.log('CONNECTING TO SERVER');
        ws = new WebSocket('ws://' + ip + ':' + gameCode); // Connect to server

        ws.onopen = function (event) {
            console.log('CONNECTED TO GAME SERVER');
            ws.send(username); // Send username to server
            
            // Check if admin
            ws.onmessage = function (event) {
                if (event.data == 'host') {
                    console.log('HOST');
                    resolve(true);
                }
                else {
                    console.log('GUEST');
                    resolve(false);
                }
            }

        };

        ws.onerror = function (event) {
            reject();
        }
    });
}

function StartGame() {
    // This function tells the server to start the game.
    ws.send('start');
}

function Send(message){
    ws.send(message);
}

function Receive(){
    ws.onmessage = function (event) {
        return event.data;
    };
}

function SendJson(json){
    ws.send(JSON.stringify(json));
}

function ReceiveJson(){
    ws.onmessage = function (event) {
        return JSON.parse(event.data);
    };
}

