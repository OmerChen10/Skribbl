
class NetworkHandler{
    constructor(player){
        this.ws = null;
        this.player = player;
        this.receivedNewMessage = false;

        this.Headers = {
            GAME_STATE: 1,
            IS_HOST: 2,
            PLAYER_ROLE: 3
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
            this.ws.send(header + "/" + data + "END");
        }
    }

    sendRaw(data){
        if(this.getSocketState()){
            this.ws.send(data);
        }
    }

    waitForNewMessage(){
        return new Promise((resolve, reject) => {
            this.ws.addEventListener("message", () => {
                resolve();
            });
        });
    }

    handlePendingRequests(msg){

        let pendingRequests = msg.split("END");
        for (let i = 0; i < pendingRequests.length - 1; i++) {
            let request = pendingRequests[i].split("/");
            console.log(request);
            let header = parseInt(request[0]);
            let data = JSON.parse(request[1]).value;

            switch (header) {
                case this.Headers.GAME_STATE:
                    if (data == "init-round") {
                        document.dispatchEvent(new CustomEvent("init-round"));
                    }
                    break;

                case this.Headers.IS_HOST:
                    document.dispatchEvent(new CustomEvent("is-host"));
                    this.player.player_data.isHost = data;
                    break;

                case this.Headers.PLAYER_ROLE:
                    this.player.player_data.role = data;
                    document.dispatchEvent(new CustomEvent("new-player-role"));
                    break;

                default:
                    break;
            }
        }

    }
}

