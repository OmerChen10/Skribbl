
class NetworkHandler{
    constructor(){
        this.ws = null;
    }

    connectToGameServer(){
        return new Promise((resolve, reject) => {
            const gameCode = location.pathname.replace('/', '');
            const ip = location.hostname;
            this.ws = new WebSocket('ws://' + ip + ':' + gameCode); // Connect to server

            this.ws.onopen = function (event) {
                console.log('CONNECTED TO GAME SERVER');
                resolve()
            };

            this.ws.onerror = function (event) {
                reject();
            }
        });
    }

    getSocketState() {
        // Return the state of the ws connection
        return (this.ws.readyState == WebSocket.OPEN);
    }

    send(message){
        this.ws.send(message);
    }

    receive(){
        return new Promise((resolve, reject) => {
            this.ws.onmessage = function (event) {
                resolve(event.data);
            };
        });
    }

    sendJson(json){
        this.ws.send(JSON.stringify(json));
    }

    receiveJson(){
        return new Promise((resolve, reject) => {
            this.ws.onmessage = function (event) {
                resolve(JSON.parse(event.data));
            };
        });
    }
}


var ws;
function connectToGameServer() {
    // This function is used to connect the user to the game server.
    return new Promise((resolve, reject) => {

        

        const gameCode = location.pathname.replace('/', '');
        const ip = location.hostname;

        console.log('CONNECTING TO SERVER');
        ws = new WebSocket('ws://' + ip + ':' + gameCode); // Connect to server

        ws.onopen = function (event) {
            console.log('CONNECTED TO GAME SERVER');
            Send(username); // Send username to server
            resolve()
        };

        ws.onerror = function (event) {
            reject();
        }
    });
}


