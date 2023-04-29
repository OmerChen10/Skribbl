
class NetworkHandler{
    constructor(player){
        this.ws = null;
        this.player = player;
        this.receivedNewMessage = false;

        this.Headers = {
            GAME_STATE: 1,
            IS_HOST: 2
        }
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

            this.ws.onmessage = function (event) {
                this.receivedNewMessage = true;
                this.handlePendingRequests(event.data);
            }.bind(this);
        });
    }

    getSocketState() {
        // Return the state of the ws connection
        return (this.ws.readyState == WebSocket.OPEN);
    }

    send(header, data){
        if(this.getSocketState()){
            this.ws.send(header + "-" + data + "END");
        }
    }

    sendRaw(data){
        if(this.getSocketState()){
            this.ws.send(data);
        }
    }

    waitForNewMessage(){
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                if(this.receivedNewMessage){
                    this.receivedNewMessage = false;
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }

    handlePendingRequests(msg){

        let pendingRequests = msg.split("END");
        for (let i = 0; i < pendingRequests.length - 1; i++) {
            let request = pendingRequests[i].split("-");
            let header = parseInt(request[0]);
            let data = JSON.parse(request[1]).value;

            switch (header) {
                case this.Headers.GAME_STATE:
                    if (data == "ACTIVE") {
                        document.dispatchEvent(new CustomEvent("game-started"));
                    }
                    break;
                case this.Headers.IS_HOST:
                    this.player.player_data.isHost = data;
                    break;
                default:
                    break;
            }
        }

    }
}

