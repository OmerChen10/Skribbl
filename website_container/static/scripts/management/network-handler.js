
class NetworkHandler{
    constructor(player){
        this.ws = null;
        this.player = player;
        this.receivedNewMessage = false;

        const Headers = {
            GAME_STATE: 0,
            IS_HOST: 1
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

    waitForBoolean(variable){
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                if(variable){
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
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

    handlePendingRequests(msg){

        let pendingRequests = msg.split("END");
        for (let i = 0; i < pendingRequests.length; i++) {
            let request = pendingRequests[i].split("-");
            let header = request[0];
            let data = JSON.parse(request[1]).value;

            switch (header) {
                case "0":
                    this.player.game.game_data.game_state = data;
                    break;
                case "1":
                    this.player.player_data.isHost = data;
                    break;
                default:
                    break;
            }
        }

    }
}

