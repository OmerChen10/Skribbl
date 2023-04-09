
class NetworkHandler{
    constructor(){
        this.ws = null;
    }

    connectToGameServer(){
        return new Promise((resolve, reject) => {
            const gameCode = location.pathname.replace('/', '');
            const ip = location.hostname;
            this.serverAddress = 'ws://' + ip + ':' + gameCode;
            this.ws = new WebSocket(this.serverAddress); // Connect to server

            this.ws.onopen = function (event) {
                console.log('CONNECTED TO GAME SERVER');
                resolve()
            };

            this.ws.onerror = function (event) {
                reject();
            }
        });
    }

    reconnectToGameServer(){
        return new Promise((resolve, reject) => {
           
            this.ws = new WebSocket(this.serverAddress); // Connect to server

            this.ws.onopen = async (event) => {
                console.log('RECONNECTED TO GAME SERVER');
                resolve(await this.receiveJson());
            };
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

