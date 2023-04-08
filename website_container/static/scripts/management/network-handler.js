
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

